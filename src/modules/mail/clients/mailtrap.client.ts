import { IMailClient } from '../mail.interface';

export class MailTrapClient implements IMailClient {
   async sendMail(
      from: string,
      to: string,
      subject: string,
      content: string,
   ): Promise<void> {
      console.log('📨 MailTrap Client');
      console.log('---------------------');
      console.log(`From: ${from}`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content: ${content}`);
      console.log('---------------------');
   }
}
