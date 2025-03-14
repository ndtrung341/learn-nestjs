import { Environment } from '@constants/app.constants';
import { plainToInstance } from 'class-transformer';
import {
   IsEnum,
   IsNumber,
   IsString,
   IsUrl,
   Matches,
   Max,
   Min,
   validateSync,
} from 'class-validator';

class EnvironmentVariables {
   @IsEnum(Environment)
   NODE_ENV: Environment;

   // Application
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

   // Database
   @IsString()
   DB_TYPE: string;

   @IsString()
   DB_HOST: string;

   @IsNumber()
   @Min(0)
   @Max(65535)
   DB_PORT: number;

   @IsString()
   DB_USERNAME: string;

   @IsString()
   DB_PASSWORD: string;

   @IsString()
   DB_NAME: string;

   // Authentication
   @IsString()
   JWT_ACCESS_TOKEN_SECRET: string;

   @IsString()
   @Matches(/^\d+(s|m|h|d|w)$/)
   JWT_ACCESS_TOKEN_EXPIRES: string;

   @IsString()
   JWT_REFRESH_TOKEN_SECRET: string;

   @IsString()
   @Matches(/^\d+(s|m|h|d|w)$/)
   JWT_REFRESH_TOKEN_EXPIRES: string;

   // Mail
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
   MAIL_FROM: string;

   @IsString()
   MAIL_FROM_NAME: string;
}

export function validateEnv(config: Record<string, unknown>) {
   const validatedConfig = plainToInstance(EnvironmentVariables, config, {
      enableImplicitConversion: true,
   });

   const errors = validateSync(validatedConfig, {
      skipMissingProperties: false,
   });

   if (errors.length > 0) {
      throw new Error(errors.toString());
   }

   return validatedConfig;
}
