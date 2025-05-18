import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { UserEntity } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

import {
   EmailAlreadyExistsException,
   EmailAlreadyVerifiedException,
} from '@exceptions/auth.exception';

import { InvalidVerificationTokenException } from '@exceptions/token.exception';
import { StorageService } from '@modules/storage/storage.service';

@Injectable()
export class UsersService {
   constructor(
      @InjectRepository(UserEntity)
      private userRepository: Repository<UserEntity>,
   ) {}

   /**
    * Create a new user with a verification token.
    */
   async createUser(dto: CreateUserDto) {
      const existingUser = await this.findOneByEmail(dto.email);

      if (existingUser) {
         throw new EmailAlreadyExistsException();
      }

      const newUser = this.userRepository.create(dto);

      return this.userRepository.save(newUser);
   }

   /**
    * Update user details.
    */
   async updateUser(id: string, dto: UpdateUserDto) {
      const user = await this.userRepository.findOneBy({ id });
      return await this.userRepository.save({ ...user, ...dto });
   }

   /**
    * Find a user by email.
    */
   async findOneByEmail(email: string) {
      return this.userRepository.findOne({
         where: { email },
      });
   }

   async findByEmails(emails: string[]) {
      return this.userRepository.find({
         where: { email: In(emails) },
      });
   }

   /**
    * Find a user by ID.
    */
   async findOneById(id: string) {
      return this.userRepository.findOneBy({ id });
   }

   /**
    * Verify a user's email using a token.
    */
   async verifyUser(id: string) {
      const user = await this.findOneById(id);

      if (!user) {
         throw new InvalidVerificationTokenException();
      }

      if (user.emailVerified) {
         throw new EmailAlreadyVerifiedException();
      }

      return this.userRepository.update(id, {
         emailVerified: true,
      });
   }

   async updatePassword(email: string, newPassword: string) {
      const user = await this.findOneByEmail(email);
      user.password = newPassword;
      return this.userRepository.save(user);
   }

   async updateAvatar(id: string, path: string) {
      return this.userRepository.update(id, { image: path });
   }
}
