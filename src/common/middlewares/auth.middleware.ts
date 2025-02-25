import {
   InvalidTokenException,
   MissingTokenException,
} from '@common/exceptions/auth.exception';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
   constructor(private readonly jwtService: JwtService) {}

   async use(req: Request, res: any, next: () => void) {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
         throw new MissingTokenException();
      }

      const [type, token] = authHeader.split(' ');

      if (type !== 'Bearer') {
         throw new InvalidTokenException();
      }

      try {
         const payload = await this.jwtService.verifyAsync(token);
         req['user'] = payload;
      } catch {
         throw new InvalidTokenException();
      }

      next();
   }
}
