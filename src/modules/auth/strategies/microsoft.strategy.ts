import { AuthConfig } from '@config/auth.config';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
   constructor(config: ConfigService) {
      const { clientID, clientSecret, callbackURL } =
         config.get<AuthConfig['microsoft']>('auth.microsoft');

      super({
         clientID,
         clientSecret,
         callbackURL,
         tenant: 'common',
         scope: ['user.read'],
      });
   }

   authenticate(req: any, options?: any) {
      return super.authenticate(req, {
         ...options,
         prompt: 'login',
      });
   }

   async validate(accessToken: string, refreshToken: string, profile: any) {
      const { name, emails } = profile;

      const user = {
         email: emails[0].value,
         firstName: name.givenName,
         lastName: name.familyName,
         photo: null,
      };

      return user;
   }
}
