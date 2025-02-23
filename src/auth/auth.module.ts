import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

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
  providers: [AuthService],
})
export class AuthModule {}
