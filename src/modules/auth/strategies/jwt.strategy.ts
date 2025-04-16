import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtAccessPayload } from '../types/jwt-payload.type';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
   constructor(
      private configService: ConfigService,
      private authService: AuthService,
   ) {
      super({
         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
         ignoreExpiration: false,
         secretOrKey: configService.getOrThrow('auth.access.secret'),
      });
   }

   async validate(payload: JwtAccessPayload) {
      const valid = await this.authService.validateAccessToken(payload.session);
      return valid ? payload : undefined;
   }
}
