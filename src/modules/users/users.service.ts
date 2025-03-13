import { Injectable } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import {
   EmailAlreadyExistsException,
   EmailAlreadyVerifiedException,
   InvalidVerificationTokenException,
} from '@common/exceptions/auth.exception';
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserDto } from './dto/update-user.dto';

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

      const verifyToken = uuidv4();
      const verifyExpires = new Date();
      verifyExpires.setMinutes(verifyExpires.getMinutes() + 2);

      const newUser = this.userRepository.create({
         ...dto,
         verifyToken,
         verifyExpires,
      });

      return this.userRepository.save(newUser);
   }

   async update(id: string, dto: UpdateUserDto) {
      const user = await this.userRepository.findOneBy({ id });
      await this.userRepository.save({ ...user, ...dto });
   }

   async findOneByEmail(email: string) {
      return this.userRepository.findOneBy({ email });
   }

   async findOneById(id: string) {
      return this.userRepository.findOneBy({ id });
   }

   async verify(token: string) {
      const user = await this.userRepository.findOneBy({ verifyToken: token });
      if (!user) {
         throw new InvalidVerificationTokenException();
      }

      if (user.isVerified) {
         throw new EmailAlreadyVerifiedException();
      }

      if (new Date() > user.verifyExpires!) {
         throw new InvalidVerificationTokenException();
      }

      return this.userRepository.update(user.id, {
         verifyToken: undefined,
         verifyExpires: undefined,
         isVerified: true,
      });
   }
}
