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
   verifyEmail: {
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
   AUTH_ACCESS_TOKEN_SECRET: string;

   @IsString()
   @Matches(/^\d+(s|m|h|d|w)$/)
   AUTH_ACCESS_TOKEN_EXPIRES_IN: string;

   @IsString()
   AUTH_REFRESH_TOKEN_SECRET: string;

   @IsString()
   @Matches(/^\d+(s|m|h|d|w)$/)
   AUTH_REFRESH_TOKEN_EXPIRES_IN: string;

   @IsString()
   @Matches(/^\d+(s|m|h|d|w)$/)
   AUTH_VERIFY_TOKEN_EXPIRES_IN: string;

   @IsString()
   @Matches(/^\d+(s|m|h|d|w)$/)
   AUTH_RESET_PASSWORD_TOKEN_EXPIRES_IN: string;

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
         secret: process.env.AUTH_ACCESS_TOKEN_SECRET,
         expires: ms(
            process.env.AUTH_ACCESS_TOKEN_EXPIRES_IN as ms.StringValue,
         ),
      },
      refresh: {
         secret: process.env.AUTH_REFRESH_TOKEN_SECRET,
         expires: ms(
            process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN as ms.StringValue,
         ),
      },
      verifyEmail: {
         secret: '',
         expires: ms(
            process.env.AUTH_VERIFY_TOKEN_EXPIRES_IN as ms.StringValue,
         ),
      },
      resetPassword: {
         secret: '',
         expires: ms(
            process.env.AUTH_RESET_PASSWORD_TOKEN_EXPIRES_IN as ms.StringValue,
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
