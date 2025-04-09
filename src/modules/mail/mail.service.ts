import { MailSendFailedException } from '@common/exceptions/mail.exception';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

enum EmailTemplate {
   VERIFICATION = 'email-verification',
   PASSWORD_RESET = 'reset-password',
   INVITATION = 'workspace-invitation',
}

@Injectable()
export class MailService {
   private readonly clientUrl: string;

   constructor(
      private readonly config: ConfigService,
      private readonly mailer: MailerService,
   ) {
      const { clientUrl } = this.config.get('app');
      this.clientUrl = clientUrl;
   }

   async sendVerificationEmail(email: string, token: string) {
      const url = `${this.clientUrl}/verification?token=${token}`;

      return this.sendEmail(
         email,
         '[MyApp] Email Verification',
         EmailTemplate.VERIFICATION,
         { url },
      );
   }

   async sendPasswordResetEmail(email: string, token: string) {
      const url = `${this.clientUrl}/reset-password?token=${token}`;

      return this.sendEmail(
         email,
         '[MyApp] Reset Your Password',
         EmailTemplate.PASSWORD_RESET,
         { url },
      );
   }

   async sendWorkspaceInvitation(options: {
      email: string;
      senderEmail: string;
      senderName: string;
      workspaceName: string;
      token: string;
   }) {
      const { senderName, senderEmail, email, token, workspaceName } = options;
      const url = `${this.clientUrl}/invitation?token=${token}`;

      return this.sendEmail(
         email,
         `[MyApp] ${senderName} has invited you to join ${workspaceName} workspace`,
         EmailTemplate.INVITATION,
         { url, senderEmail, senderName, workspaceName },
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
