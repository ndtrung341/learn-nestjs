import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { UsersModule } from '@modules/users/users.module';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MailModule } from '@modules/mail/mail.module';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.stategy';

@Module({
   controllers: [AuthController],
   imports: [
      UsersModule,
      PassportModule,
      MailModule,
      JwtModule.register({}),
      // JwtModule.registerAsync({
      //    global: true,
      //    inject: [ConfigService],
      //    useFactory: (config: ConfigService) => {
      //       return {
      //          secret: config.get('jwt.secret'),
      //          signOptions: {
      //             expiresIn: config.get('jwt.expires'),
      //          },
      //       };
      //    },
      // }),
   ],
   providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
