import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtRefreshPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
   Strategy,
   'jwt-refresh',
) {
   constructor(private configService: ConfigService) {
      super({
         jwtFromRequest: ExtractJwt.fromExtractors([
            (req: Request) => req.cookies?.['refresh_token'],
         ]),
         ignoreExpiration: false,
         secretOrKey: configService.getOrThrow('auth.refreshSecret'),
      });
   }

   async validate(payload: JwtRefreshPayload) {
      return payload;
   }
}
