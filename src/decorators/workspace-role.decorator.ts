import { WorkspaceMemberRole } from '@modules/workspaces/entities/workspace-member.entity';
import { WorkspaceRoleGuard } from '@modules/workspaces/guards/workspace-permission.guard';
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

export const WORKSPACE_ROLE_KEY = 'workspace-permission';

export const WorkspaceRole = (...roles: WorkspaceMemberRole[]) =>
   applyDecorators(
      SetMetadata(WORKSPACE_ROLE_KEY, roles),
      UseGuards(WorkspaceRoleGuard),
   );
