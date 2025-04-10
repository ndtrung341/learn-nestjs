import { registerAs } from '@nestjs/config';

import { IsNumber, IsString, Max, Min } from 'class-validator';
import validateEnv from '@utils/validate-env';

export type DbConfig = {
   type: string;
   host: string;
   port: number;
   username: string;
   password: string;
   database: string;
};

export class DbEnvVariables {
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
}

export const dbConfig = registerAs<DbConfig>('db', () => {
   validateEnv(process.env, DbEnvVariables);
   console.log({
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
   });
   return {
      type: process.env.DB_TYPE,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
   };
});
