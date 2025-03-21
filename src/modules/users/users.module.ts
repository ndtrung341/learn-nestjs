import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './users.controller';

import { SessionsService } from './services/sessions.service';
import { UsersService } from './services/users.service';

import { UserEntity } from './entities/user.entity';
import { SessionEntity } from './entities/session.entity';

@Module({
   imports: [TypeOrmModule.forFeature([UserEntity, SessionEntity])],
   controllers: [UsersController],
   providers: [UsersService, SessionsService],
   exports: [UsersService, SessionsService],
})
export class UsersModule {}
