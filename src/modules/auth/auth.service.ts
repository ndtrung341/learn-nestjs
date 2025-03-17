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

@Injectable()
export class AuthService {
   constructor(
      private readonly configService: ConfigService,
      private readonly usersService: UsersService,
      private readonly mailService: MailService,
      private readonly jwtService: JwtService,
   ) {}

   // Registers a new user and sends an email verification.
   async register(dto: RegisterDto) {
      const newUser = await this.usersService.create(dto);
      await this.mailService.sendEmailVerification(
         newUser.email,
         newUser.verifyToken,
      );
      return newUser;
   }

   // Logs in a user and generates authentication tokens.
   async login(dto: LoginDto, res: Response) {
      const user = await this.validateUser(dto.email, dto.password);

      if (!user) throw new InvalidCredentialsException();

      if (!user.isVerified) throw new EmailNotVerifiedException();

      const session = await this.usersService.createSession(user.id);

      const { refreshToken, refreshExpiresIn, ...token } =
         await this.generateTokenPairs(user.id, session.id, session.jti);

      this.setRefreshTokenCookie(res, refreshToken, refreshExpiresIn);

      return {
         user,
         ...token,
      };
   }

   // Validates user credentials.
   async validateUser(email: string, password: string) {
      const user = await this.usersService.findOneByEmail(email);
      const isPasswordValid = user && (await user.checkPassword(password));
      return isPasswordValid ? user : null;
   }

   // Verifies a user's email using the provided verification token.
   async verifyEmail(token: string) {
      await this.usersService.verify(token);
   }

   // Reissues authentication tokens if the refresh token is valid.
   async reissueTokens(
      userId: string,
      sessionId: string,
      jti: string,
      res: Response,
   ) {
      // Validate and update the session before issuing new tokens
      const session = await this.usersService.updateSession(sessionId, jti);

      const { refreshToken, refreshExpiresIn, ...token } =
         await this.generateTokenPairs(userId, session.id, session.jti);

      this.setRefreshTokenCookie(res, refreshToken, refreshExpiresIn);

      return {
         ...token,
      };
   }

   // Generates access and refresh token pairs.
   private async generateTokenPairs(sub: string, session: string, jti: string) {
      const accessPayload = { sub, session };
      const refreshPayload = { sub, session, jti };

      const [accessToken, refreshToken] = await Promise.all([
         this.jwtService.signAsync(accessPayload, {
            secret: this.configService.get<string>('jwt.secret'),
            expiresIn: this.configService.get('jwt.expires'),
         }),
         this.jwtService.signAsync(refreshPayload, {
            secret: this.configService.get('jwt.refreshSecret'),
            expiresIn: this.configService.get('jwt.refreshExpires'),
         }),
      ]);

      return {
         accessToken,
         expiresIn: +ms(this.configService.get('jwt.expires')!),
         refreshToken,
         refreshExpiresIn: +ms(this.configService.get('jwt.refreshExpires')!),
      };
   }

   // Sets the refresh token in the response cookies.
   private setRefreshTokenCookie(res: Response, token: string, maxAge: number) {
      res.cookie('refresh_token', token, {
         httpOnly: true,
         sameSite: 'strict',
         path: `${this.configService.get('app.prefix')}/auth/refresh`,
         maxAge,
      });
   }
}
