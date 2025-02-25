import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToClass } from 'class-transformer';
import { UsersService } from '@modules/users/users.service';
import { MailService } from '@modules/mail/mail.service';
import { UserDto } from '@modules/users/dto/user.dto';
import { comparePassword, hashPassword } from '@utils/password';
import {
   EmailAlreadyExistsException,
   EmailNotVerifiedException,
   InvalidCredentialsException,
   InvalidVerificationTokenException,
} from '@common/exceptions/auth.exception';
import { LoginDto, RegisterDto } from '../dto';
import { VerificationService } from './verification.service';

@Injectable()
export class AuthService {
   constructor(
      private readonly userService: UsersService,
      private readonly jwtService: JwtService,
      private readonly mailService: MailService,
      private readonly verificationService: VerificationService,
   ) {}

   async register(registerDto: RegisterDto) {
      const existingUser = await this.userService.findByEmail(
         registerDto.email,
      );
      if (existingUser) {
         throw new EmailAlreadyExistsException();
      }

      const passwordHash = await hashPassword(registerDto.password);
      const user = await this.userService.create({
         ...registerDto,
         password: passwordHash,
      });

      await this.sendVerificationEmail(user);

      return user;
   }

   async login(loginDto: LoginDto) {
      const user = await this.validateUser(loginDto.email, loginDto.password);

      if (!user) {
         throw new InvalidCredentialsException();
      }

      if (!user.verified) {
         throw new EmailNotVerifiedException();
      }

      const accessToken = await this.jwtService.signAsync({
         userId: user.id,
         email: user.email,
         fullname: user.fullName,
      });

      return {
         user,
         accessToken,
      };
   }

   async validateUser(email: string, password: string) {
      const user = await this.userService.findByEmail(email);
      if (user) {
         const { password: passwordHash, ...result } = user;
         const isPasswordValid = await comparePassword(password, passwordHash);
         return isPasswordValid ? result : null;
      }
      return null;
   }

   async verifyEmail(token: string) {
      const userId = this.verificationService.validateToken(token);
      const user = userId ? await this.userService.findById(userId) : null;

      if (!user) {
         throw new InvalidVerificationTokenException();
      }

      if (user.verified) {
         throw new EmailAlreadyExistsException();
      }

      await this.userService.update(user.id, { verified: true });
   }

   private async sendVerificationEmail(user: any): Promise<void> {
      const token = this.verificationService.generateToken(user.id);
      const url = this.verificationService.getVerificationUrl(token);

      await this.mailService.sendMail(
         user.email,
         'Verify Your Email',
         `Hi ${user.fullName}. Please verify your email by clicking this link: 
     ${url}`,
      );
   }
}
