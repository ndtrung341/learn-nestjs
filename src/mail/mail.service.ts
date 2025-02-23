import { Inject, Injectable } from '@nestjs/common';
import { IMailClient, IMailConfig } from './mail.interface';
import { MailSendFailed } from 'src/common/exceptions/domain.exception';

@Injectable()
export class MailService {
  constructor(
    @Inject('MAIL_CONFIG') private readonly config: IMailConfig,
    @Inject('MAIL_CLIENT') private readonly client: IMailClient,
  ) {}

  async sendMail(to: string, subject: string, content: string) {
    try {
      const { from } = this.config;
      await this.client.sendMail(from, to, subject, content);
    } catch (error) {
      console.error('Mail error:', {
        to,
        subject,
        error: error.message,
      });
      throw new MailSendFailed(
        `Failed to send email to ${to}: ${error.message}`,
      );
    }
  }
}
