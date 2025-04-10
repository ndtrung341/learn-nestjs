import { UserEntity } from '@modules/users/entities/user.entity';
import {
   WorkspaceMemberEntity,
   WorkspaceMemberRole,
} from '@modules/workspaces/entities/workspace-member.entity';
import { WorkspaceEntity } from '@modules/workspaces/entities/workspace.entity';
import { randomNumber } from '@utils/number';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class Workspace1744254511698 implements Seeder {
   track = false;

   public async run(
      dataSource: DataSource,
      factoryManager: SeederFactoryManager,
   ) {
      const userRepository = dataSource.getRepository(UserEntity);
      const users = await userRepository.find();
      const me = users[0];

      const workspaceFactory = factoryManager.get(WorkspaceEntity);
      const workspaces = await workspaceFactory.saveMany(3, { owner: me });

      const memberRepository = dataSource.getRepository(WorkspaceMemberEntity);
      const members = workspaces.flatMap((workspace) => {
         const admin = memberRepository.create({
            workspace,
            user: me,
            role: WorkspaceMemberRole.ADMIN,
            joinedAt: new Date(),
         });

         const memberships = getRandomUsers(users.slice(1)).map((user) =>
            memberRepository.create({
               user,
               workspace,
               role: WorkspaceMemberRole.MEMBER,
               invitedBy: admin,
               joinedAt: new Date(),
            }),
         );

         return [admin, ...memberships];
      });

      await memberRepository.insert(members);
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
