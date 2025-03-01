import { ROLES_KEY } from '@common/decorators/roles.decorator';
import { Role } from '@constants/roles';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

export class RolesGuard implements CanActivate {
   constructor(private reflector: Reflector) {}

   canActivate(context: ExecutionContext) {
      const requiredRoles = this.reflector.getAllAndOverride<
         Role[] | undefined
      >(ROLES_KEY, [context.getHandler(), context.getClass()]);

      if (!requiredRoles) {
         return true;
      }

      const request = context.switchToHttp().getRequest();
      const user = request.user;

      return requiredRoles.includes(user.role);

      return false;
   }
}
