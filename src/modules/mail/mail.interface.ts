export interface IMailConfig {
   from: string;
   replyTo: string;
   provider: 'sendgrid' | 'mailtrap';
   apiKey?: string;
}

export interface IMailClient {
   sendMail(
      from: string,
      to: string,
      subject: string,
      content: string,
   ): Promise<void>;
}

export interface MailModuleOptions extends IMailConfig {
   isGlobal?: boolean;
}

export interface MailModuleAsyncOptions {
   useFactory: (...args: any[]) => Promise<IMailConfig> | IMailConfig;
   inject?: any[];
   imports?: any[];
   isGlobal?: boolean;
}
