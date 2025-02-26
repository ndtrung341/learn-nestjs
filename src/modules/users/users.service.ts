import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { RegisterDto } from '@auth/dto';
import { UserNotFoundException } from '@common/exceptions/user.exception';
import { UsersRepository } from './repositories/user.repository';

@Injectable()
export class UsersService {
   constructor(private readonly usersRepository: UsersRepository) {}

   findById(id: string) {
      try {
         const user = this.usersRepository.findOne(id);
         if (!user) {
            throw new UserNotFoundException(`User with ID ${id} not found`);
         }
         return user;
      } catch (error) {
         throw new InternalServerErrorException(error.message);
      }
   }

   findByEmail(email: string) {
      return this.usersRepository.findByEmail(email);
   }

   async create(data: RegisterDto) {
      const user = await this.usersRepository.create({
         ...data,
         verified: false,
      });
      return user;
   }

   async update(id: string, data: Partial<UserDto>) {
      const user = await this.usersRepository.update(id, data);
      return user;
   }
}
