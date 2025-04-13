import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AuthConfig } from '@config/auth.config';

export type GoogleProfile = {
   firstName: string;
   lastName: string;
   email: string;
   photo?: string;
};

@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(Strategy, 'google') {
   constructor(config: ConfigService) {
      const { clientID, clientSecret, callbackURL } =
         config.get<AuthConfig['google']>('auth.google');

      super({
         clientID,
         clientSecret,
         callbackURL,
         scope: ['email', 'profile'],
      });
   }

   async validate(accessToken: string, refreshToken: string, profile: Profile) {
      const { name, emails, photos } = profile;

      const user: GoogleProfile = {
         email: emails[0].value,
         firstName: name.givenName,
         lastName: name.familyName,
         photo: photos[0].value,
      };

      return user;
   }
}
