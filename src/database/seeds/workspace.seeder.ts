import { BaseSeeder } from '@db/core/base.seeder';
import { WorkspaceFactory } from '@db/factories/workspace.factory';
import { UserEntity } from '@modules/users/entities/user.entity';
import {
   WorkspaceMemberEntity,
   WorkspaceMemberRole,
} from '@modules/workspaces/entities/workspace-member.entity';
import { WorkspaceEntity } from '@modules/workspaces/entities/workspace.entity';
import { randomNumber } from '@utils/number';

export class WorkspaceSeeder extends BaseSeeder {
   async run() {
      const workspaceRepo = this.dataSource.getRepository(WorkspaceEntity);
      const memberRepo = this.dataSource.getRepository(WorkspaceMemberEntity);
      const userRepo = this.dataSource.getRepository(UserEntity);

      const users = await userRepo.find();
      const adminUser = users[0]; // First user is admin

      // Insert workspaces
      const workspaceFactory = new WorkspaceFactory();
      const workspaces = workspaceFactory.createMany(4);

      const inserted = await workspaceRepo.insert(workspaces);
      const workspaceIds = inserted.identifiers.map((w) => w.id);

      // Create members for each workspace
      const members = workspaceIds.flatMap((workspaceId) => {
         // Admin member
         const adminMember = {
            userId: adminUser.id,
            workspaceId: workspaceId,
            role: WorkspaceMemberRole.ADMIN,
         };

         // Random normal members
         const normalMembers = getRandomUsers(users.slice(1)).map((user) => ({
            userId: user.id,
            workspaceId: workspaceId,
            role: WorkspaceMemberRole.NORMAL,
         }));

         return [adminMember, ...normalMembers];
      });

      // Save all workspace members
      await memberRepo.insert(members);
   }
}

function getRandomUsers(users: UserEntity[]) {
   const amount = randomNumber(1, users.length);
   const uniqueUsers = new Map<string, UserEntity>();

   while (uniqueUsers.size < amount) {
      const user = users[randomNumber(0, users.length - 1)];
      if (!uniqueUsers.has(user.id)) {
         uniqueUsers.set(user.id, user);
      }
   }

   return [...uniqueUsers.values()];
}
