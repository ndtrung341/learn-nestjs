import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { UsersModule } from '@modules/users/users.module';
import { VerificationService } from './services/verification.service';
import { AuthService } from './services/auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
   controllers: [AuthController],
   imports: [
      UsersModule,
      PassportModule,
      JwtModule.registerAsync({
         global: true,
         inject: [ConfigService],
         useFactory: (config: ConfigService) => {
            return {
               secret: config.get('jwt.secret'),
               signOptions: {
                  expiresIn: config.get('jwt.expires'),
               },
            };
         },
      }),
   ],
   providers: [AuthService, VerificationService, LocalStrategy],
})
export class AuthModule {}
