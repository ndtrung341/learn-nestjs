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

      const verifyToken = uuidv4();
      const verifyExpires = dayjs()
         .add(this.configService.get('auth.verifyExpiresIn'))
         .toDate();

      const newUser = this.userRepo.create({
         ...dto,
         verifyToken,
         verifyExpires,
      });

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
      return this.userRepo.findOneByOrFail({ id });
   }

   /**
    * Verify a user's email using a token.
    */
   async verifyEmailToken(token: string) {
      const user = await this.userRepo.findOneBy({ verifyToken: token });

      if (!user || dayjs().isAfter(user.verifyExpires)) {
         throw new InvalidVerificationTokenException();
      }

      if (user.emailVerified) {
         throw new EmailAlreadyVerifiedException();
      }

      return this.userRepo.update(user.id, {
         verifyToken: null,
         verifyExpires: null,
         emailVerified: true,
      });
   }

   /**
    * Generates a password reset token.
    */
   async generatePasswordResetToken(email: string) {
      const resetToken = uuidv4();
      const resetExpires = dayjs()
         .add(this.configService.get('auth.resetPasswordExpiresIn'))
         .toDate();

      const { affected } = await this.userRepo.update(
         { email },
         { resetToken, resetExpires },
      );

      if (!affected) {
         throw new UserNotFoundException();
      }

      return resetToken;
   }

   /**
    * Reset the user's password using reset token.
    */
   async resetPassword(token: string, newPassword: string) {
      const user = await this.userRepo.findOneBy({ resetToken: token });

      if (!user || dayjs().isAfter(user.resetExpires)) {
         throw new InvalidResetPasswordTokenException();
      }

      user.password = newPassword;
      user.resetToken = null;
      user.resetExpires = null;

      await this.userRepo.save(user);
   }
}
