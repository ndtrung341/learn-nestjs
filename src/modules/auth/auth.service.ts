import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@modules/users/users.service';
import {
   EmailNotVerifiedException,
   InvalidCredentialsException,
} from '@common/exceptions/auth.exception';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '@modules/mail/mail.service';
import { Response } from 'express';
import ms from 'ms';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
   constructor(
      private readonly configService: ConfigService,
      private readonly usersService: UsersService,
      private readonly mailService: MailService,
      private readonly jwtService: JwtService,
   ) {}

   // Register a new user and initiate email verification
   async register(dto: RegisterDto) {
      const newUser = await this.usersService.create(dto);
      await this.mailService.sendEmailVerification(
         newUser.email,
         newUser.verifyToken!,
      );
      return newUser;
   }

   // Authenticate user and return user data with access token
   async login(dto: LoginDto, res: Response) {
      const user = await this.validateUser(dto.email, dto.password);

      if (!user) {
         throw new InvalidCredentialsException();
      }

      if (!user.isVerified) {
         throw new EmailNotVerifiedException();
      }

      const tokens = await this.generateJwtTokens({
         sub: user.id,
         email: user.email,
      });

      res.cookie('refresh_token', tokens.refreshToken, {
         httpOnly: true,
         sameSite: 'strict',
         path: '/api/auth/refresh',
         maxAge: +ms(this.configService.getOrThrow('jwt.refreshExpires')),
      });

      return {
         user,
         accessToken: tokens.accessToken,
         expiresIn: ms(this.configService.getOrThrow('jwt.expires')),
      };
   }

   // Validate user's credentials and return user;
   async validateUser(email: string, password: string) {
      const user = await this.usersService.findOneByEmail(email);
      const isPasswordValid = user && (await user.checkPassword(password));
      return isPasswordValid ? user : null;
   }

   // Verify email using a token and update user status accordingly
   async verifyEmail(token: string) {
      await this.usersService.verify(token);
   }

   async refreshToken(payload: JwtPayload) {
      const accessToken = await this.jwtService.signAsync(payload, {
         secret: this.configService.getOrThrow('jwt.secret'),
         expiresIn: this.configService.getOrThrow('jwt.expires'),
      });

      return { accessToken };
   }

   // Generate access and refresh JWT tokens
   private async generateJwtTokens(payload: JwtPayload) {
      const [accessToken, refreshToken] = await Promise.all([
         this.jwtService.signAsync(payload, {
            secret: this.configService.getOrThrow('jwt.secret'),
            expiresIn: this.configService.getOrThrow('jwt.expires'),
         }),
         this.jwtService.signAsync(payload, {
            secret: this.configService.getOrThrow('jwt.refreshSecret'),
            expiresIn: this.configService.getOrThrow('jwt.refreshExpires'),
         }),
      ]);

      return {
         accessToken,
         refreshToken,
      };
   }
}
