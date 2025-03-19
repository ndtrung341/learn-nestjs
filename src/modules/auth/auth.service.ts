import { Injectable } from '@nestjs/common';
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

@Injectable()
export class AuthService {
   constructor(
      private configService: ConfigService,
      private usersService: UsersService,
      private mailService: MailService,
      private jwtService: JwtService,
   ) {}

   /**
    * Retrieves the current user.
    */
   async getCurrentUser(id: string) {
      return this.usersService.findOneById(id);
   }

   /**
    * Registers a new user and sends a verification email.
    */
   async register(dto: RegisterDto) {
      const user = await this.usersService.createUser(dto);
      await this.mailService.sendVerificationEmail(
         user.email,
         user.verifyToken!,
      );
      return user;
   }

   /**
    * Authenticates a user and issues tokens.
    */
   async login(dto: LoginDto, res: Response) {
      const user = await this.validateUser(dto.email, dto.password);

      if (!user) throw new InvalidCredentialsException();
      if (!user.isVerified) throw new EmailNotVerifiedException();

      const session = await this.usersService.createSession(user.id);
      const tokens = await this.generateTokens(
         user.id,
         session.id,
         session.token,
      );

      this.setRefreshTokenCookie(
         res,
         tokens.refreshToken,
         tokens.refreshExpiresIn,
      );

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
      const result = await this.usersService.deleteSession(sessionId);
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
      await this.usersService.verifyEmailToken(token);
   }

   /**
    * Check if an access token is valid.
    */
   async validateAccessToken(sessionId: string) {
      const isBlacklisted =
         await this.usersService.isSessionBlacklisted(sessionId);
      return !isBlacklisted;
   }

   /**
    * Validate refresh token and rotate session if valid.
    */
   async validateAndRotateSession(sessionId: string, token: string) {
      const session = await this.usersService.validateSessionToken(
         sessionId,
         token,
      );

      return this.usersService.rotateSession(session);
   }

   /**
    * Reissues authentication tokens if the session is valid.
    */
   async refreshTokens(
      userId: string,
      sessionId: string,
      token: string,
      res: Response,
   ) {
      const session = await this.validateAndRotateSession(sessionId, token);
      const tokens = await this.generateTokens(
         userId,
         session.id,
         session.token,
      );

      this.setRefreshTokenCookie(
         res,
         tokens.refreshToken,
         tokens.refreshExpiresIn,
      );

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
   private setRefreshTokenCookie(res: Response, token: string, maxAge: number) {
      res.cookie('refresh_token', token, {
         httpOnly: true,
         sameSite: 'strict',
         path: `${this.configService.get('app.prefix')}/auth/refresh`,
         maxAge,
      });
   }

   /**
    * Initiates password reset process by sending email with reset token.
    */
   async initiatePasswordReset(email: string) {
      const token = await this.usersService.generatePasswordResetToken(email);
      await this.mailService.sendPasswordResetEmail(email, token);
   }

   /**
    * Completes password reset process by verifying token and setting new password.
    */
   async completePasswordReset(token: string, newPassword: string) {
      return this.usersService.resetPassword(token, newPassword);
   }
}
