import { MailSendFailedException } from '@common/exceptions/mail.exception';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
   private endpoint: string;

   constructor(
      private readonly config: ConfigService,
      private readonly mailer: MailerService,
   ) {
      this.endpoint =
         this.config.get('app.baseUrl') + this.config.get('app.prefix');
   }

   async sendVerificationEmail(email: string, token: string) {
      try {
         const url = `${this.endpoint}/auth/verify?token=${token}`;

         await this.mailer.sendMail({
            to: email,
            subject: 'Email Verification - MyApp',
            template: 'email-verification',
            context: {
               url,
            },
         });
      } catch (error) {
         throw new MailSendFailedException(error.message);
      }
   }

   async sendPasswordResetEmail(email: string, token: string) {
      try {
         const url = `https://your-frontend.com/reset-password?token=${token}`;

         await this.mailer.sendMail({
            to: email,
            subject: 'Reset Your Password – MyApp',
            template: 'reset-password',
            context: {
               url,
            },
         });
      } catch (error) {
         throw new MailSendFailedException(error.message);
      }
   }
}
