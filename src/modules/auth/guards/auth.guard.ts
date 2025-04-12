import { InvalidTokenException } from '@exceptions/token.exception';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

export class AuthGuard extends PassportAuthGuard('jwt') {
   handleRequest(err, user) {
      if (err || !user) {
         throw new InvalidTokenException();
      }

      return user;
   }
}
