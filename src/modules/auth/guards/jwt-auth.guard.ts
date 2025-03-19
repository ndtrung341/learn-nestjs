import { InvalidTokenException } from '@common/exceptions/token.exception';
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
   handleRequest(err, user) {
      if (err || !user) {
         throw new InvalidTokenException();
      }

      return user;
   }
}
