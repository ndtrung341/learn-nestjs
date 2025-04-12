import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WorkspacesService } from '../workspaces.service';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { WORKSPACE_ROLE_KEY } from '@decorators/workspace-role.decorator';
import { AccessDeniedException } from '@exceptions/auth.exception';

@Injectable()
export class WorkspaceRoleGuard implements CanActivate {
   constructor(
      private reflector: Reflector,
      private workspacesService: WorkspacesService,
   ) {}

   canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest<Request>();
      const userId = request.user['sub'];
      const workspaceId = this.extractWorkspaceId(request);

      if (!userId || !workspaceId) return false;

      const roles = this.reflector.getAllAndOverride(WORKSPACE_ROLE_KEY, [
         context.getHandler(),
         context.getClass(),
      ]);

      if (!this.workspacesService.hasPermission(userId, workspaceId, roles)) {
         throw new AccessDeniedException();
      }

      return true;
   }

   private extractWorkspaceId(request: Request) {
      return request.params?.id || request.body?.workspaceId;
   }
}
