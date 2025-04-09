import { WorkspaceMemberRole } from '@modules/workspaces/entities/workspace-member.entity';
import { SetMetadata } from '@nestjs/common';

export const WORKSPACE_PERMISSION_KEY = 'workspace-permission';
export const WorkspacePermission = (...permissions: WorkspaceMemberRole[]) =>
   SetMetadata(WORKSPACE_PERMISSION_KEY, permissions);
