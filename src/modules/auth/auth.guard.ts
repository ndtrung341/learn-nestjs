import { InvalidTokenException } from '@common/exceptions/auth.exception';
import {
   CanActivate,
   ExecutionContext,
   Injectable,
   UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
   constructor(private readonly jwtService: JwtService) {}

   async canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeaders(request);

      try {
         const payload = await this.jwtService.verifyAsync(token);
         request['user'] = payload;
      } catch {
         throw new InvalidTokenException();
      }

      return true;
   }

   private extractTokenFromHeaders(request: Request) {
      const authorization = request.headers['authorization'];
      if (!authorization || !authorization.startsWith('Bearer')) {
         throw new InvalidTokenException();
      }

      const token = authorization.split(' ')[1] || null;
      if (!token) {
         throw new InvalidTokenException();
      }

      return token;
   }
}
