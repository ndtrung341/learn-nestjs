import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

export type GoogleProfile = {
   firstName: string;
   lastName: string;
   email: string;
   photo?: string;
};

@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(Strategy, 'google') {
   constructor(
      configService: ConfigService,
      private authService: AuthService,
   ) {
      super({
         clientID: configService.get('auth.google.clientId'),
         clientSecret: configService.get('auth.google.clientSecret'),
         callbackURL: 'http://localhost:3000/api/auth/google/redirect',
         scope: ['email', 'profile'],
      });
   }

   async validate(
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback,
   ) {
      const { name, emails, photos } = profile;
      console.log(profile);
      const user: GoogleProfile = {
         email: emails[0].value,
         firstName: name.givenName,
         lastName: name.familyName,
         photo: photos[0].value,
      };

      done(null, user);
   }
}
