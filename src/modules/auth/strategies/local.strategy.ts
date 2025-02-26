import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
   constructor(private readonly authService: AuthService) {
      super({ usernameField: 'email', passwordField: 'password' });
   }

   async validate(email: string, password: string) {
      const user = await this.authService.validateUser(email, password);
      if (!user) {
         throw new UnauthorizedException('Invalid credentials');
      }
      return user;
   }
}
