import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './controllers/auth.controller';
import { GoogleAuthController } from './controllers/google-auth.controller';

import { UsersModule } from '@modules/users/users.module';
import { MailModule } from '@modules/mail/mail.module';

import { AuthService } from './services/auth.service';

import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.stategy';
import { GoogleOAuthStrategy } from './strategies/google.strategy';
import { MicrosoftStrategy } from './strategies/microsoft.strategy';
import { MicrosoftAuthController } from './controllers/microsoft-auth.controller';
import { PasswordResetService } from './services/password-reset.service';

@Module({
   controllers: [AuthController, GoogleAuthController, MicrosoftAuthController],
   imports: [UsersModule, PassportModule, MailModule, JwtModule.register({})],
   providers: [
      AuthService,
      PasswordResetService,
      LocalStrategy,
      JwtStrategy,
      JwtRefreshStrategy,
      GoogleOAuthStrategy,
      MicrosoftStrategy,
   ],
})
export class AuthModule {}
