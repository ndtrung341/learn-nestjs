import { registerAs } from '@nestjs/config';
import validateEnv from '@utils/validate-env';
import ms from 'ms';
import { IsString, Matches } from 'class-validator';

export type AuthConfig = {
   secret: string;
   expiresIn: number;
   refreshSecret: string;
   refreshExpiresIn: number;
   verifyExpiresIn: number;
   resetPasswordExpiresIn: number;
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
}

export const authConfig = registerAs<AuthConfig>('auth', () => {
   validateEnv(process.env, AuthEnvVariables);

   return {
      secret: process.env.AUTH_ACCESS_TOKEN_SECRET,
      expiresIn: ms(process.env.AUTH_ACCESS_TOKEN_EXPIRES_IN as ms.StringValue),
      refreshSecret: process.env.AUTH_REFRESH_TOKEN_SECRET,
      refreshExpiresIn: ms(
         process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN as ms.StringValue,
      ),
      verifyExpiresIn: ms(
         process.env.AUTH_VERIFY_TOKEN_EXPIRES_IN as ms.StringValue,
      ),
      resetPasswordExpiresIn: ms(
         process.env.AUTH_RESET_PASSWORD_TOKEN_EXPIRES_IN as ms.StringValue,
      ),
   };
});
