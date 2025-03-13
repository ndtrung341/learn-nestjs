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
   async login(dto: LoginDto) {
      const user = await this.validateUser(dto.email, dto.password);

      if (!user) {
         throw new InvalidCredentialsException();
      }

      if (!user.isVerified) {
         throw new EmailNotVerifiedException();
      }

      const tokens = await this.generateJwtTokens({
         id: user.id,
         email: user.email,
      });

      return {
         user,
         ...tokens,
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

   // Generate access and refresh JWT tokens
   private async generateJwtTokens(payload: any) {
      const [accessToken, refreshToken] = await Promise.all([
         this.jwtService.signAsync(payload, {
            secret: this.configService.get('jwt.secret'),
            expiresIn: this.configService.get('jwt.expires'),
         }),
         this.jwtService.signAsync(payload, {
            secret: this.configService.get('jwt.refreshSecret'),
            expiresIn: this.configService.get('jwt.refreshExpires'),
         }),
      ]);

      return { accessToken, refreshToken };
   }
}
