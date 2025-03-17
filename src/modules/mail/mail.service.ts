import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
   constructor(
      private readonly config: ConfigService,
      private readonly mailer: MailerService,
   ) {}

   async sendEmailVerification(email: string, token: string) {
      try {
         const url =
            this.config.get('app.baseUrl') + '/api/auth/verify?token=' + token;

         await this.mailer.sendMail({
            to: email,
            subject: 'Email Verification',
            template: 'email-verification',
            context: {
               url,
            },
         });
      } catch (error) {
         console.log(error);
      }
   }
}
