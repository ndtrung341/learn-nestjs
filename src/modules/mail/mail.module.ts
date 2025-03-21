import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail.service';
import { join } from 'path';

@Module({
   imports: [
      MailerModule.forRootAsync({
         useFactory: (config: ConfigService) => {
            return {
               transport: {
                  host: config.get('mail.host'),
                  port: config.get('mail.port'),
                  secure: false, // true for 465, false for other ports
                  auth: {
                     user: config.get('mail.user'),
                     pass: config.get('mail.pass'),
                  },
               },
               defaults: {
                  from: `'${config.get('mail.fromName')}' <${config.get('mail.fromAddress')}>`,
               },
               template: {
                  dir: join(__dirname, 'templates'),
                  adapter: new HandlebarsAdapter(),
                  options: {
                     strict: true,
                  },
               },
            };
         },
         inject: [ConfigService],
      }),
   ],
   providers: [MailService],
   exports: [MailService],
})
export class MailModule {}
