import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './controllers/auth.controller';
import { GoogleAuthController } from './controllers/google-auth.controller';

import { UsersModule } from '@modules/users/users.module';
import { MailModule } from '@modules/mail/mail.module';

import { AuthService } from './auth.service';

import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.stategy';
import { GoogleOAuthStrategy } from './strategies/google.strategy';

@Module({
   controllers: [AuthController, GoogleAuthController],
   imports: [UsersModule, PassportModule, MailModule, JwtModule.register({})],
   providers: [
      AuthService,
      LocalStrategy,
      JwtStrategy,
      JwtRefreshStrategy,
      GoogleOAuthStrategy,
   ],
})
export class AuthModule {}
