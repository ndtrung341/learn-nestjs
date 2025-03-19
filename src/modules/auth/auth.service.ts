import {
   BadRequestException,
   Injectable,
   UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import ms from 'ms';

import { UsersService } from '@modules/users/users.service';
import { MailService } from '@modules/mail/mail.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import {
   EmailNotVerifiedException,
   InvalidCredentialsException,
   SessionNotFoundException,
} from '@common/exceptions/auth.exception';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AuthService {
   constructor(
      private configService: ConfigService,
      private usersService: UsersService,
      private mailService: MailService,
      private jwtService: JwtService,
   ) {}
   /**
    * Registers a new user and sends a verification email.
    */
   async register(dto: RegisterDto) {
      const user = await this.usersService.create(dto);
      await this.mailService.sendEmailVerification(
         user.email,
         user.verifyToken,
      );
      return user;
   }

   /**
    * Authenticates a user and issues tokens.
    */
   async login(dto: LoginDto, res?: Response) {
      const user = await this.validateUser(dto.email, dto.password);

      if (!user) throw new InvalidCredentialsException();
      if (!user.isVerified) throw new EmailNotVerifiedException();

      const session = await this.usersService.createSession(user.id);
      const tokens = await this.generateTokens(
         user.id,
         session.id,
         session.token,
      );
      // this.setRefreshToken(res, tokens.refreshToken, tokens.refreshExpiresIn);

      return {
         user,
         accessToken: tokens.accessToken,
         expiresIn: tokens.expiresIn,
      };
   }

   /**
    * Logs out by invalidating the session and clearing cookies.
    */
   async logout(sessionId: string, res: Response) {
      const result = await this.usersService.removeSession(sessionId);
      if (result.affected === 0) throw new SessionNotFoundException();
      res.clearCookie('refresh_token');
   }

   /**
    * Validates user credentials.
    */
   async validateUser(email: string, password: string) {
      const user = await this.usersService.findOneByEmail(email);
      return user && (await user.checkPassword(password)) ? user : null;
   }

   /**
    * Verifies a user's email
    */
   async verifyEmail(token: string) {
      await this.usersService.verify(token);
   }

   /**
    * Check if an access token is valid.
    */
   async validateAccessToken(sessionId: string) {
      const blacklisted =
         await this.usersService.isSessionBlacklisted(sessionId);
      return !blacklisted;
   }

   /**
    * Validate refresh token and rotate session if valid.
    */
   async validateRefreshToken(sessionId: string, token: string) {
      const session = await this.usersService.checkSessionValidity(
         sessionId,
         token,
      );

      return this.usersService.rotateSession(session);
   }

   /**
    * Reissues authentication tokens if the session is valid.
    */
   async reissueTokens(
      userId: string,
      sessionId: string,
      token: string,
      res: Response,
   ) {
      const session = await this.validateRefreshToken(sessionId, token);
      const tokens = await this.generateTokens(
         userId,
         session.id,
         session.token,
      );

      this.setRefreshToken(res, tokens.refreshToken, tokens.refreshExpiresIn);

      return { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn };
   }

   /**
    * Generates access and refresh tokens.
    */
   private async generateTokens(
      userId: string,
      sessionId: string,
      token: string,
   ) {
      const accessPayload = { sub: userId, session: sessionId };
      const refreshPayload = { sub: userId, session: sessionId, token };

      const [accessToken, refreshToken] = await Promise.all([
         this.jwtService.signAsync(accessPayload, {
            secret: this.configService.get<string>('jwt.secret'),
            expiresIn: this.configService.get('jwt.expires'),
         }),
         this.jwtService.signAsync(refreshPayload, {
            secret: this.configService.get<string>('jwt.refreshSecret'),
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

   /**
    * Sets the refresh token in HTTP-only cookies.
    */
   private setRefreshToken(res: Response, token: string, maxAge: number) {
      res.cookie('refresh_token', token, {
         httpOnly: true,
         sameSite: 'strict',
         path: `${this.configService.get('app.prefix')}/auth/refresh`,
         maxAge,
      });
   }
}
