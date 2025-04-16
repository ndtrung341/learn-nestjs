import { registerAs } from '@nestjs/config';
import validateEnv from '@utils/validate-env';
import { IsString, Matches } from 'class-validator';
import ms from 'ms';

export type AuthConfig = {
   access: {
      secret: string;
      expires: number;
   };
   refresh: {
      secret: string;
      expires: number;
   };
   verify: {
      secret: string;
      expires: number;
   };
   resetPassword: {
      secret: string;
      expires: number;
   };
   google: {
      clientID: string;
      clientSecret: string;
      callbackURL: string;
   };
   microsoft: {
      clientID: string;
      clientSecret: string;
      callbackURL: string;
   };
};

export class AuthEnvVariables {
   @IsString()
   AUTH_ACCESS_SECRET: string;

   @IsString()
   @Matches(/^\d+(s|m|h|d|w)$/)
   AUTH_ACCESS_EXPIRES_IN: string;

   @IsString()
   AUTH_REFRESH_SECRET: string;

   @IsString()
   @Matches(/^\d+(s|m|h|d|w)$/)
   AUTH_REFRESH_EXPIRES_IN: string;

   @IsString()
   AUTH_VERIFY_EMAIL_SECRET: string;

   @IsString()
   @Matches(/^\d+(s|m|h|d|w)$/)
   AUTH_VERIFY_EMAIL_EXPIRES_IN: string;

   @IsString()
   AUTH_PASSWORD_RESET_SECRET: string;

   @IsString()
   @Matches(/^\d+(s|m|h|d|w)$/)
   AUTH_PASSWORD_RESET_EXPIRES_IN: string;

   @IsString()
   AUTH_GOOGLE_CLIENT_ID: string;

   @IsString()
   AUTH_GOOGLE_CLIENT_SECRET: string;

   @IsString()
   AUTH_GOOGLE_CALLBACK_URL: string;

   @IsString()
   AUTH_AZURE_CLIENT_ID: string;

   @IsString()
   AUTH_AZURE_CLIENT_SECRET: string;

   @IsString()
   AUTH_AZURE_CALLBACK_URL: string;
}

export const authConfig = registerAs<AuthConfig>('auth', () => {
   validateEnv(process.env, AuthEnvVariables);

   return {
      access: {
         secret: process.env.AUTH_ACCESS_SECRET,
         expires: ms(process.env.AUTH_ACCESS_EXPIRES_IN as ms.StringValue),
      },
      refresh: {
         secret: process.env.AUTH_REFRESH_SECRET,
         expires: ms(process.env.AUTH_REFRESH_EXPIRES_IN as ms.StringValue),
      },
      verify: {
         secret: process.env.AUTH_VERIFY_EMAIL_SECRET,
         expires: ms(
            process.env.AUTH_VERIFY_EMAIL_EXPIRES_IN as ms.StringValue,
         ),
      },
      resetPassword: {
         secret: process.env.AUTH_PASSWORD_RESET_SECRET,
         expires: ms(
            process.env.AUTH_PASSWORD_RESET_EXPIRES_IN as ms.StringValue,
         ),
      },
      google: {
         clientID: process.env.AUTH_GOOGLE_CLIENT_ID,
         clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
         callbackURL: process.env.AUTH_GOOGLE_CALLBACK_URL,
      },
      microsoft: {
         clientID: process.env.AUTH_AZURE_CLIENT_ID,
         clientSecret: process.env.AUTH_AZURE_CLIENT_SECRET,
         callbackURL: process.env.AUTH_AZURE_CALLBACK_URL,
      },
   };
});
