import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';

import configuration from '@config/configuration';
import { validateEnv } from '@utils/validate-env';
import { SharedModule } from '@shared/shared.module';
import { DatabaseModule } from '@db/database.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
   imports: [
      ConfigModule.forRoot({
         isGlobal: true,
         cache: true,
         expandVariables: true,
         load: [configuration],
         validate: validateEnv,
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
