import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,

    //  MailModule.register({
    //    from: 'noreply@example.com',
    //    replyTo: 'support@example.com',
    //    provider: 'sendgrid',
    //    apiKey: 'XXX-XXX-XXX',
    //    isGlobal: true,
    //  }),

    MailModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        from: configService.get('MAIL_FROM', 'noreply@example.com'),
        replyTo: configService.get('MAIL_REPLY_TO', 'support@example.com'),
        provider: configService.get('MAIL_PROVIDER', 'sendgrid'),
        apiKey: configService.get('MAIL_API_KEY', 'XXX-XXX-XXX'),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
