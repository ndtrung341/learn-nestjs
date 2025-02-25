import { IMailClient } from '../mail.interface';

export class SendGridClient implements IMailClient {
   async sendMail(
      from: string,
      to: string,
      subject: string,
      content: string,
   ): Promise<void> {
      console.log('📨 SendGrid Client');
      console.log('---------------------');
      console.log(`From: ${from}`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content: ${content}`);
      console.log('---------------------');
   }
}
