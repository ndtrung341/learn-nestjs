import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  controllers: [AuthController],
  imports: [UsersModule, MailModule],
  providers: [{ provide: 'AUTH', useClass: AuthService }],
})
export class AuthModule {}
