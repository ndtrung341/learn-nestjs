import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { UsersModule } from '@modules/users/users.module';
import { VerificationService } from './services/verification.service';
import { AuthService } from './services/auth.service';

@Module({
   controllers: [AuthController],
   imports: [
      UsersModule,
      JwtModule.registerAsync({
         global: true,
         inject: [ConfigService],
         useFactory: (config: ConfigService) => {
            console.log(config.get('jwt.expires'));
            return {
               secret: config.get('jwt.secret'),
               signOptions: {
                  expiresIn: config.get('jwt.expires'),
               },
            };
         },
      }),
   ],
   providers: [AuthService, VerificationService],
})
export class AuthModule {}
