import { registerAs } from '@nestjs/config';

import { IsNumber, IsString, Max, Min } from 'class-validator';
import validateEnv from '@utils/validate-env';

type RedisConfig = {
   host: string;
   port: number;
};

export class RedisEnvVariables {
   @IsString()
   REDIS_HOST: string;

   @IsNumber()
   @Min(0)
   @Max(65535)
   REDIS_PORT: number;
}

export const redisConfig = registerAs<RedisConfig>('redis', () => {
   validateEnv(process.env, RedisEnvVariables);

   return {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT, 10),
   };
});
