import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WorkspacesService } from '../workspaces.service';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { WORKSPACE_PERMISSION_KEY } from '@common/decorators/workspace-permission.decorator';

@Injectable()
export class WorkspacePermissionGuard implements CanActivate {
   constructor(
      private reflector: Reflector,
      private workspacesService: WorkspacesService,
   ) {}

   canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest<Request>();
      const userId = request.user['sub'];
      const workspaceId = this.extractWorkspaceId(request);

      if (!userId || !workspaceId) return false;

      const roles = this.reflector.getAllAndOverride(WORKSPACE_PERMISSION_KEY, [
         context.getHandler(),
         context.getClass(),
      ]);

      return this.workspacesService.hasPermission(userId, workspaceId, roles);
   }

   private extractWorkspaceId(request: Request) {
      return request.params?.id || request.body?.workspaceId;
   }
}
