import { registerAs } from '@nestjs/config';

import { IsNumber, IsString, Max, Min } from 'class-validator';
import validateEnv from '@utils/validate-env';

export type MailConfig = {
   host: string;
   port: number;
   user: any;
   pass: any;
   fromAddress: string;
   fromName: string;
};

export class MailEnvVariables {
   @IsString()
   MAIL_HOST: string;

   @IsNumber()
   @Min(0)
   @Max(65535)
   MAIL_PORT: number;

   @IsString()
   MAIL_USER: string;

   @IsString()
   MAIL_PASS: string;

   @IsString()
   MAIL_FROM_ADDRESS: string;

   @IsString()
   MAIL_FROM_NAME: string;
}

export const mailConfig = registerAs<MailConfig>('mail', () => {
   validateEnv(process.env, MailEnvVariables);

   return {
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT, 10) : 587,
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
      fromAddress: process.env.MAIL_FROM_ADDRESS,
      fromName: process.env.MAIL_FROM_NAME,
   };
});
