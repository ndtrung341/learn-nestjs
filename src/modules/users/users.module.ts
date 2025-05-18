import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './users.controller';

import { SessionsService } from './services/sessions.service';
import { UsersService } from './services/users.service';

import { UserEntity } from './entities/user.entity';
import { SessionEntity } from './entities/session.entity';

import { StorageModule } from '@modules/storage/storage.module';
import { StorageType } from '@modules/storage/interfaces/storage.interface';
import { ConfigService } from '@nestjs/config';

@Module({
   imports: [
      TypeOrmModule.forFeature([UserEntity, SessionEntity]),
      // StorageModule.register({
      //    type: StorageType.LOCAL,
      //    options: { root: 'assets' },
      // }),
      StorageModule.registerAsync({
         inject: [ConfigService],
         useFactory: (configService: ConfigService) => {
            return {
               type: StorageType.CLOUDINARY,
               options: {
                  apiKey: configService.get('CLOUDINARY_API_KEY'),
                  apiSecret: configService.get('CLOUDINARY_API_SECRET'),
                  cloudName: configService.get('CLOUDINARY_CLOUD_NAME'),
               },
            };
         },
      }),
   ],
   controllers: [UsersController],
   providers: [UsersService, SessionsService],
   exports: [UsersService, SessionsService],
})
export class UsersModule {}
