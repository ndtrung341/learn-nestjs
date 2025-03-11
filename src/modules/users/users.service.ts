import { Injectable } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { EmailAlreadyExistsException } from '@common/exceptions/auth.exception';

@Injectable()
export class UsersService {
   constructor(
      @InjectRepository(UserEntity)
      private userRepository: Repository<UserEntity>,
   ) {}

   async create(dto: CreateUserDto) {
      const existingUser = await this.findOneByEmail(dto.email);

      if (existingUser) {
         throw new EmailAlreadyExistsException();
      }

      const newUser = this.userRepository.create(dto);

      return this.userRepository.save(newUser);
   }

   async findOneByEmail(email: string) {
      return this.userRepository.findOneBy({ email });
   }

   async findOneById(id: string) {
      return this.userRepository.findOneBy({ id });
   }
}
