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

import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

import { UserNotFoundException } from '@exceptions/user.exception';
import {
   InvalidResetPasswordTokenException,
   InvalidVerificationTokenException,
} from '@exceptions/token.exception';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
   constructor(
      private configService: ConfigService,
      @InjectRepository(UserEntity)
      private userRepo: Repository<UserEntity>,
   ) {}

   /**
    * Create a new user with a verification token.
    */
   async createUser(dto: CreateUserDto) {
      const existingUser = await this.findOneByEmail(dto.email);

      if (existingUser) {
         throw new EmailAlreadyExistsException();
      }

      const newUser = this.userRepo.create(dto);

      return this.userRepo.save(newUser);
   }

   /**
    * Update user details.
    */
   async updateUser(id: string, dto: UpdateUserDto) {
      const user = await this.userRepo.findOneBy({ id });
      return await this.userRepo.save({ ...user, ...dto });
   }

   /**
    * Find a user by email.
    */
   async findOneByEmail(email: string) {
      return this.userRepo.findOne({
         where: { email },
      });
   }

   async findByEmails(emails: string[]) {
      return this.userRepo.find({
         where: { email: In(emails) },
      });
   }

   /**
    * Find a user by ID.
    */
   async findOneById(id: string) {
      return this.userRepo.findOneBy({ id });
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

      return this.userRepo.update(id, {
         emailVerified: true,
      });
   }

   async updatePassword(email: string, newPassword: string) {
      return this.userRepo.update({ email }, { password: newPassword });
   }
}
