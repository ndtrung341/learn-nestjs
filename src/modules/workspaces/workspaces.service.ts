import { Injectable } from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

import { WorkspaceEntity } from './entities/workspace.entity';
import {
   WorkspaceMemberEntity,
   WorkspaceMemberRole,
} from './entities/workspace-member.entity';

import { UsersService } from '@modules/users/services/users.service';
import { MailService } from '@modules/mail/mail.service';
import { UserEntity } from '@modules/users/entities/user.entity';
import { Transaction } from '@common/decorators/transaction.decorator';

@Injectable()
export class WorkspacesService {
   constructor(
      private readonly usersService: UsersService,
      private readonly jwtService: JwtService,
      private readonly mailService: MailService,
      @InjectRepository(WorkspaceEntity)
      private readonly workspaceRepository: Repository<WorkspaceEntity>,
      @InjectRepository(WorkspaceMemberEntity)
      private readonly memberRepository: Repository<WorkspaceMemberEntity>,
   ) {}

   /**
    * Get a workspace by ID with member information
    */
   async getWorkspaceById(id: string) {
      return this.workspaceRepository.findOneOrFail({
         where: { id },
         relations: {
            members: {
               user: true,
            },
         },
      });
   }

   async getWorkspacesByUserId(userId: string) {
      // TODO: To implement if needed
   }

   async hasPermission(
      userId: string,
      workspaceId: string,
      roles: WorkspaceMemberRole[],
   ) {
      const membership = await this.memberRepository.findOneBy({
         userId,
         workspaceId,
      });

      return membership && roles.includes(membership.role);
   }

   /**
    * Create a new workspace and add the owner as an admin member
    */
   @Transaction()
   async createWorkspace(ownerId: string, data: CreateWorkspaceDto) {
      const workspace = await this.workspaceRepository.save({
         ownerId,
         ...data,
      });

      await this.memberRepository.insert({
         userId: ownerId,
         workspaceId: workspace.id,
         role: WorkspaceMemberRole.ADMIN,
         joinedAt: new Date(),
      });

      return workspace;
   }

   /**
    * Update workspace details
    */
   async updateWorkspace(id: string, dto: UpdateWorkspaceDto) {
      const workspace = await this.workspaceRepository.findOneByOrFail({ id });
      const updated = this.workspaceRepository.merge(workspace, dto);
      return this.workspaceRepository.save(updated);
   }

   /**
    * Delete a workspace
    */
   async deleteWorkspace(id: string) {
      const workspace = await this.workspaceRepository.findOneByOrFail({ id });
      await this.workspaceRepository.delete(workspace.id);
   }

   /**
    * Invite users to a workspace
    */
   @Transaction()
   async inviteUsers(
      senderId: string,
      workspaceId: string,
      inviteeEmails: string[],
      role: WorkspaceMemberRole,
   ) {
      const [workspace, sender, invitedUsers] = await Promise.all([
         this.workspaceRepository.findOneByOrFail({ id: workspaceId }),
         this.usersService.findOneById(senderId),
         this.usersService.findByEmails(inviteeEmails),
      ]);

      const pendingInvites = invitedUsers.map((user) =>
         this.memberRepository.create({
            role,
            workspaceId,
            userId: user.id,
            invitedById: sender.id,
            invitedAt: new Date(),
         }),
      );

      const saved = await this.memberRepository.save(pendingInvites);

      await Promise.all(
         invitedUsers.map((user) =>
            this.sendInvitationEmail(sender, user, workspace),
         ),
      );

      return saved;
   }

   /**
    * Resend an invitation to a workspace
    */
   async resendInvitation(
      senderId: string,
      userId: string,
      workspaceId: string,
   ) {
      const [sender, membership] = await Promise.all([
         this.usersService.findOneById(senderId),
         this.memberRepository.findOneOrFail({
            where: { workspaceId, userId: userId, joinedAt: IsNull() },
            relations: {
               workspace: true,
               user: true,
            },
         }),
      ]);

      return this.sendInvitationEmail(
         sender,
         membership.user,
         membership.workspace,
      );
   }

   /**
    * Cancel a pending invitation
    */
   async cancelInvitation(inviteeId: string, workspaceId: string) {
      return this.memberRepository.delete({
         userId: inviteeId,
         workspaceId,
         joinedAt: IsNull(),
      });
   }

   /**
    * Respond to an invitation (accept or decline)
    */
   async respondInvitation(
      userId: string,
      workspaceId: string,
      isAccept: boolean,
   ) {
      if (isAccept) {
         await this.memberRepository.update(
            { userId, workspaceId, joinedAt: IsNull() },
            { joinedAt: new Date() },
         );
         return this.workspaceRepository.findOneByOrFail({ id: workspaceId });
      } else {
         this.cancelInvitation(userId, workspaceId);
      }
   }

   /**
    * Send an invitation email to a user
    */
   private async sendInvitationEmail(
      sender: UserEntity,
      invitee: UserEntity,
      workspace: WorkspaceEntity,
   ): Promise<void> {
      const token = this.jwtService.sign({
         userId: invitee.id,
         workspaceId: workspace.id,
      });

      await this.mailService.sendWorkspaceInvitation({
         token,
         email: invitee.email,
         senderEmail: sender.email,
         senderName: sender.fullName,
         workspaceName: workspace.name,
      });
   }
}
