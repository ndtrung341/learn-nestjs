import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
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

@Module({
   imports: [
      ConfigModule.forRoot({
         isGlobal: true,
         cache: true,
         expandVariables: true,
         load: [appConfig, authConfig, dbConfig, mailConfig],
      }),
      CacheModule.register({ isGlobal: true }),
      ScheduleModule.forRoot(),
      DatabaseModule,
      SharedModule,
      UsersModule,
      AuthModule,
   ],
   controllers: [AppController],
   providers: [AppService],
})
export class AppModule {}
