import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';

import { UsersModule } from '@modules/users/users.module';
import { MailModule } from '@modules/mail/mail.module';

import { AuthService } from './auth.service';

import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.stategy';

@Module({
   controllers: [AuthController],
   imports: [UsersModule, PassportModule, MailModule, JwtModule.register({})],
   providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
