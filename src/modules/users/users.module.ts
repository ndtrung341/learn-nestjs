import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { SessionEntity } from './entities/session.entity';

@Module({
   imports: [TypeOrmModule.forFeature([UserEntity, SessionEntity])],
   controllers: [UsersController],
   providers: [UsersService],
   exports: [UsersService],
})
export class UsersModule {}
