import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
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
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET', 'Trung handsome'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES', '60s') },
      }),
    }),
  ],
  exports: [JwtModule],
  providers: [AuthService, VerificationService],
})
export class AuthModule {}
