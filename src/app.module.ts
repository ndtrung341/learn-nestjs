import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule, CacheOptions } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { SharedModule } from '@shared/shared.module';
import { DatabaseModule } from '@db/database.module';

import { appConfig } from '@config/app.config';
import { authConfig } from '@config/auth.config';
import { dbConfig } from '@config/db.config';
import { mailConfig } from '@config/mail.config';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { redisConfig } from '@config/redis.config';
import KeyvRedis from '@keyv/redis';

@Module({
   imports: [
      ConfigModule.forRoot({
         isGlobal: true,
         cache: true,
         expandVariables: true,
         load: [appConfig, authConfig, dbConfig, mailConfig, redisConfig],
      }),
      CacheModule.registerAsync({
         isGlobal: true,
         inject: [ConfigService],
         useFactory: (config: ConfigService) => ({
            stores: [
               new KeyvRedis({
                  socket: {
                     host: config.get('redis.host'),
                     port: config.get('redis.port'),
                  },
               }),
            ],
         }),
      }),
      ScheduleModule.forRoot(),
      DatabaseModule,
      SharedModule,
      UsersModule,
      AuthModule,
      WorkspacesModule,
   ],
   controllers: [AppController],
   providers: [AppService],
})
export class AppModule {}
