import { MailSendFailedException } from '@common/exceptions/mail.exception';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

enum EmailTemplate {
   VERIFICATION = 'email-verification',
   PASSWORD_RESET = 'reset-password',
}

@Injectable()
export class MailService {
   private readonly apiUrl: string;
   private readonly clientUrl: string;

   constructor(
      private readonly config: ConfigService,
      private readonly mailer: MailerService,
   ) {
      const { url, prefix, clientUrl } = this.config.get('app');
      this.apiUrl = `${url}/${prefix}`;
      this.clientUrl = clientUrl;
   }

   async sendVerificationEmail(email: string, token: string) {
      const url = `${this.apiUrl}/auth/verify?token=${token}`;

      return this.sendEmail(
         email,
         'Email Verification - MyApp',
         EmailTemplate.VERIFICATION,
         { url },
      );
   }

   async sendPasswordResetEmail(email: string, token: string) {
      const url = `${this.clientUrl}/reset-password?token=${token}`;

      return this.sendEmail(
         email,
         'Reset Your Password – MyApp',
         EmailTemplate.PASSWORD_RESET,
         { url },
      );
   }

   private async sendEmail(
      to: string,
      subject: string,
      template: EmailTemplate,
      context?: Record<string, any> | any,
   ) {
      try {
         await this.mailer.sendMail({
            to,
            subject,
            template,
            context,
         });
      } catch (error) {
         throw new MailSendFailedException(error.message);
      }
   }
}
