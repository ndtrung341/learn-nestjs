import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

import { UsersService } from '@modules/users/services/users.service';
import { SessionsService } from '@modules/users/services/sessions.service';
import { MailService } from '@modules/mail/mail.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import {
   EmailNotVerifiedException,
   InvalidCredentialsException,
} from '@common/exceptions/auth.exception';

@Injectable()
export class AuthService {
   constructor(
      private configService: ConfigService,
      private usersService: UsersService,
      private sessionsService: SessionsService,
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
         user.verifyToken,
      );
      return user;
   }

   /**
    * Authenticates a user and issues tokens.
    */
   async login(dto: LoginDto, res: Response) {
      const user = await this.validateUser(dto.email, dto.password);

      if (!user) throw new InvalidCredentialsException();
      if (!user.emailVerified) throw new EmailNotVerifiedException();

      const session = await this.sessionsService.createSession(user.id);
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
      await this.sessionsService.deleteSession(sessionId);
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
         await this.sessionsService.isSessionBlacklisted(sessionId);
      return !isBlacklisted;
   }

   /**
    * Validate refresh token and rotate session if valid.
    */
   async validateAndRotateSession(sessionId: string, token: string) {
      const session = await this.sessionsService.validateSessionToken(
         sessionId,
         token,
      );

      return this.sessionsService.rotateSession(session);
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

      return {
         accessToken: tokens.accessToken,
         expiresIn: tokens.expiresIn,
      };
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

      const secret = this.configService.get('auth.secret');
      const expiresIn = this.configService.get('auth.expiresIn');
      const refreshSecret = this.configService.get('auth.refreshSecret');
      const refreshExpiresIn = this.configService.get('auth.refreshExpiresIn');

      const [accessToken, refreshToken] = await Promise.all([
         this.jwtService.signAsync(accessPayload, {
            secret,
            expiresIn: expiresIn / 1000,
         }),
         this.jwtService.signAsync(refreshPayload, {
            secret: refreshSecret,
            expiresIn: refreshExpiresIn / 1000,
         }),
      ]);

      return {
         accessToken,
         expiresIn,
         refreshToken,
         refreshExpiresIn,
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
