import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

import {
   EmailAlreadyExistsException,
   EmailAlreadyVerifiedException,
} from '@common/exceptions/auth.exception';

import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

import { UserNotFoundException } from '@common/exceptions/user.exception';
import {
   InvalidResetPasswordTokenException,
   InvalidVerificationTokenException,
} from '@common/exceptions/token.exception';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
   constructor(
      private configService: ConfigService,
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
      console.log(this.configService.get('auth.verifyExpiresIn'));
      const verifyToken = uuidv4();
      const verifyExpires = dayjs()
         .add(this.configService.get('auth.verifyExpiresIn'))
         .toDate();

      const newUser = this.userRepository.create({
         ...dto,
         verifyToken,
         verifyExpires,
      });

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

   /**
    * Find a user by ID.
    */
   async findOneById(id: string) {
      return this.userRepository.findOneBy({ id });
   }

   /**
    * Verify a user's email using a token.
    */
   async verifyEmailToken(token: string) {
      const user = await this.userRepository.findOneBy({ verifyToken: token });

      if (!user || dayjs().isAfter(user.verifyExpires)) {
         throw new InvalidVerificationTokenException();
      }

      if (user.emailVerified) {
         throw new EmailAlreadyVerifiedException();
      }

      return this.userRepository.update(user.id, {
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

      const { affected } = await this.userRepository.update(
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
      const user = await this.userRepository.findOneBy({ resetToken: token });

      if (!user || dayjs().isAfter(user.resetExpires)) {
         throw new InvalidResetPasswordTokenException();
      }

      user.password = newPassword;
      user.resetToken = null;
      user.resetExpires = null;

      await this.userRepository.save(user);
   }
}
