import { IS_PUBLIC_KEY } from '@common/decorators/auth.decorators';
import { InvalidTokenException } from '@common/exceptions/token.exception';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

export class AuthGuard extends PassportAuthGuard('jwt') {
   constructor(private reflector: Reflector) {
      super();
   }

   canActivate(context: ExecutionContext) {
      const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
         context.getHandler(),
         context.getClass(),
      ]);

      if (isPublic) {
         return true;
      }

      return super.canActivate(context);
   }

   handleRequest(err, user) {
      if (err || !user) {
         throw new InvalidTokenException();
      }

      return user;
   }
}
