import { ROLES_KEY } from '@common/decorators/roles.decorator';
import { AccessDeniedException } from '@common/exceptions/auth.exception';
import { Role } from '@constants/roles';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
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

      if (!requiredRoles.includes(user.role)) {
         const details =
            process.env.NODE_ENV === 'development'
               ? {
                    requiredRoles,
                    role: user.role,
                 }
               : undefined;

         throw new AccessDeniedException(details);
      }

      return true;
   }
}
