import { ArrayNotEmpty, IsEmail, IsEnum, IsUUID } from 'class-validator';
import { WorkspaceMemberRole } from '../entities/workspace-member.entity';

export class InvitationDto {
   @IsEmail({}, { each: true })
   @ArrayNotEmpty()
   emails: string[];

   @IsEnum(WorkspaceMemberRole)
   role: WorkspaceMemberRole;
}

export class ResendInvitationDto {
   @IsUUID()
   userId: string;

   @IsUUID()
   workspaceId: string;
}

export class CancelInvitationDto {
   @IsUUID()
   userId: string;

   @IsUUID()
   workspaceId: string;
}
