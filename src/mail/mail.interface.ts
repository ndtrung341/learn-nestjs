export interface IMailConfig {
  from: string;
  replyTo: string;
}
export interface IMailClient {
  sendMail(
    from: string,
    to: string,
    subject: string,
    content: string,
  ): Promise<void>;
}
