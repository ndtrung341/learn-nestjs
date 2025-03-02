import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@modules/users/users.service';
import { MailService } from '@modules/mail/mail.service';
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
      private readonly usersService: UsersService,
      private readonly jwtService: JwtService,
      private readonly mailService: MailService,
      private readonly verificationService: VerificationService,
   ) {}

   // Register a new user and initiate email verification
   async signup(registerDto: RegisterDto) {
      const existingUser = await this.usersService.findByEmail(
         registerDto.email,
      );
      if (existingUser) {
         throw new EmailAlreadyExistsException();
      }

      const hashedPassword = await hashPassword(registerDto.password);
      const newUser = await this.usersService.create({
         ...registerDto,
         password: hashedPassword,
      });

      await this.sendVerificationEmail(newUser);

      return newUser;
   }

   // Authenticate user and return user data with access token
   async signin(loginDto: LoginDto) {
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
         fullName: user.fullName,
      });

      return {
         user,
         accessToken,
      };
   }

   // Validate user's credentials and return user data without password
   async validateUser(email: string, password: string) {
      const user = await this.usersService.findByEmail(email);
      if (user) {
         const { password: hashedPassword, ...userData } = user;
         const isPasswordValid = await comparePassword(
            password,
            hashedPassword,
         );
         return isPasswordValid ? userData : null;
      }
      return null;
   }

   // Verify email using a token and update user status
   async verifyEmail(token: string) {
      const userId = this.verificationService.validateToken(token);
      const user = userId ? await this.usersService.findById(userId) : null;

      if (!user) {
         throw new InvalidVerificationTokenException();
      }

      if (user.verified) {
         throw new EmailAlreadyExistsException(); // TODO: Consider a more specific exception
      }

      return await this.usersService.update(user.id, { verified: true });
   }

   // Send a verification email to the user and return the verification URL
   private async sendVerificationEmail(user: any) {
      const token = this.verificationService.generateToken(user.id);
      const verificationUrl =
         this.verificationService.getVerificationUrl(token);

      await this.mailService.sendMail(
         user.email,
         'Verify Your Email',
         `Hi ${user.fullName}. Please verify your email by clicking this link: ${verificationUrl}`,
      );
   }
}
