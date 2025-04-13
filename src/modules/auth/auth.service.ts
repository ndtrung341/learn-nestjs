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
} from '@exceptions/auth.exception';
import { GoogleProfile } from './strategies/google.strategy';

@Injectable()
export class AuthService {
   private readonly accessTokenSecret: string;
   private readonly accessTokenExpires: number;

   private readonly refreshTokenSecret: string;
   private readonly refreshTokenExpires: number;

   constructor(
      private configService: ConfigService,
      private usersService: UsersService,
      private sessionsService: SessionsService,
      private mailService: MailService,
      private jwtService: JwtService,
   ) {
      const { access, refresh } = configService.get('auth');

      this.accessTokenSecret = access.secret;
      this.accessTokenExpires = access.expires;

      this.refreshTokenSecret = refresh.secret;
      this.refreshTokenExpires = refresh.expires;
   }

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

      const session = await this.sessionsService.createSession(
         user.id,
         this.refreshTokenExpires,
      );

      const { accessToken, expiresIn } = await this.generateTokens(
         user.id,
         session.id,
         session.token,
         res,
      );

      return {
         user,
         accessToken,
         expiresIn,
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
    * Reissues authentication tokens if the session is valid.
    */
   async refreshTokens(
      userId: string,
      sessionId: string,
      token: string,
      res: Response,
   ) {
      const session = await this.sessionsService.validateAndRotateSession(
         sessionId,
         token,
      );

      return this.generateTokens(userId, session.id, session.token, res);
   }

   /**
    * Generates access and refresh tokens.
    */
   private async generateTokens(
      userId: string,
      sessionId: string,
      token: string,
      res: Response,
   ) {
      const accessPayload = { sub: userId, session: sessionId };
      const refreshPayload = { sub: userId, session: sessionId, token };

      const [accessToken, refreshToken] = await Promise.all([
         this.jwtService.signAsync(accessPayload, {
            secret: this.accessTokenSecret,
            expiresIn: this.accessTokenExpires / 1000,
         }),
         this.jwtService.signAsync(refreshPayload, {
            secret: this.refreshTokenSecret,
            expiresIn: this.refreshTokenExpires / 1000,
         }),
      ]);

      res.cookie('refresh_token', token, {
         httpOnly: true,
         sameSite: 'strict',
         path: `${this.configService.get('app.prefix')}/auth/refresh`,
         maxAge: this.refreshTokenExpires,
      });

      return {
         accessToken,
         expiresIn: this.accessTokenExpires,
      };
   }

   /**
    * Sets the refresh token in HTTP-only cookies.
    */
   private setRefreshTokenCookie(res: Response, token: string) {
      res.cookie('refresh_token', token, {
         httpOnly: true,
         sameSite: 'strict',
         path: `${this.configService.get('app.prefix')}/auth/refresh`,
         maxAge: this.refreshTokenExpires,
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

   async handleGoogleAuth(profile: GoogleProfile, res: Response) {
      let user = await this.usersService.findOneByEmail(profile.email);

      if (!user) {
         user = await this.usersService.createUser({
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            image: profile.photo,
            password: null,
            emailVerified: true,
         });
      }

      const session = await this.sessionsService.createSession(
         user.id,
         this.refreshTokenExpires,
      );

      return this.generateTokens(user.id, session.id, session.token, res);
   }
}
