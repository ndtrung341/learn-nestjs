import { Environment } from '@constants/app.constants';
import { registerAs } from '@nestjs/config';

import {
   IsEnum,
   IsNumber,
   IsString,
   IsUrl,
   Matches,
   Max,
   Min,
} from 'class-validator';
import validateEnv from '@utils/validate-env';
import ms from 'ms';

type AppConfig = {
   environment: string;
   url: string;
   frontendURL: string;
   prefix: string;
   port: number;
};

export class AppEnvVariables {
   @IsEnum(Environment)
   NODE_ENV: Environment;

   @IsString()
   APP_NAME: string;

   @IsUrl({ require_tld: false })
   APP_URL: string;

   @IsNumber()
   @Min(0)
   @Max(65535)
   APP_PORT: number;

   @IsString()
   APP_PREFIX: string;

   @IsUrl({ require_tld: false })
   FRONTEND_URL: string;

   @IsString()
   INVITATION_TOKEN_SECRET;

   @IsString()
   @Matches(/^\d+(s|m|h|d|w)$/)
   INVITATION_TOKEN_EXPIRES_IN: string;
}

export const appConfig = registerAs<AppConfig>('app', () => {
   validateEnv(process.env, AppEnvVariables);

   return {
      environment: process.env.NODE_ENV || Environment.DEVELOPMENT,
      url: process.env.APP_URL || 'http://localhost:3000',
      frontendURL: process.env.FRONTEND_URL || 'http://localhost',
      prefix: process.env.APP_PREFIX || '',
      port: process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 3000,
      invitation: {
         secret: process.env.INVITATION_TOKEN_SECRET,
         expiresIn: ms(
            process.env.INVITATION_TOKEN_EXPIRES_IN as ms.StringValue,
         ),
      },
   };
});
