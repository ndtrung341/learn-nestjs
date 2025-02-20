import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';
import { SendGridClient } from './clients/sendgrid.client';
import { MailTrapClient } from './clients/mailtrap.client';

@Module({
  providers: [
    // Static Mail Config (useValue)
    {
      provide: 'MAIL_CONFIG',
      useValue: {
        from: 'noreply@example.com',
        replyTo: 'support@example.com',
      },
    },

    // Dynamic Mail Client (useFactory)
    {
      provide: 'MAIL_CLIENT',
      useFactory: (config: ConfigService): SendGridClient | MailTrapClient => {
        const provider = config.get('MAIL_PROVIDER', 'mailtrap');
        switch (provider) {
          case 'sendgrid':
            return new SendGridClient();
          default:
            return new MailTrapClient();
        }
      },
      inject: [ConfigService],
    },

    // MailService (useClass)
    MailService,

    // Alias (useExisting)
    {
      provide: 'MAIL_SERVICE_ALIAS',
      useExisting: MailService,
    },
  ],
  exports: [MailService],
})
export class MailModule {}
