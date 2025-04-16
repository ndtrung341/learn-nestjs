import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Response } from 'express';

import { UsersService } from '@modules/users/services/users.service';
import { SessionsService } from '@modules/users/services/sessions.service';
import { MailService } from '@modules/mail/mail.service';

import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

import {
   EmailNotVerifiedException,
   InvalidCredentialsException,
} from '@exceptions/auth.exception';
import { InvalidVerificationTokenException } from '@exceptions/token.exception';

@Injectable()
export class AuthService {
   private readonly accessTokenSecret: string;
   private readonly accessTokenExpires: number;

   private readonly refreshTokenSecret: string;
   private readonly refreshTokenExpires: number;

   private readonly verifyTokenSecret: string;
   private readonly verifyTokenExpires: number;

   constructor(
      private configService: ConfigService,
      private usersService: UsersService,
      private sessionsService: SessionsService,
      private mailer: MailService,
      private jwt: JwtService,
      @Inject(CACHE_MANAGER) private cacheManager: Cache,
   ) {
      const { access, refresh, verify } = configService.get('auth');

      this.accessTokenSecret = access.secret;
      this.accessTokenExpires = access.expires;

      this.refreshTokenSecret = refresh.secret;
      this.refreshTokenExpires = refresh.expires;

      this.verifyTokenSecret = verify.secret;
      this.verifyTokenExpires = verify.expires;
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
      const verifyToken = await this.jwt.signAsync(
         {},
         {
            secret: this.verifyTokenSecret,
            subject: user.id,
            expiresIn: this.verifyTokenExpires / 1000,
         },
      );
      await this.mailer.sendVerificationEmail(user.email, verifyToken);
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
      const payload = await this.validateVerifyToken(token);
      await this.usersService.verifyUser(payload.sub);
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
    * Handles authentication via OAuth providers.
    */
   async handleOAuthLogin(provider: string, profile: any, res: Response) {
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

      const { accessToken, expiresIn } = await this.generateTokens(
         user.id,
         session.id,
         session.token,
         res,
      );

      const redirectURL = `${this.configService.get(
         'app.frontendURL',
      )}/auth/callback?token=${accessToken}&expires=${expiresIn}`;

      return redirectURL;
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
         this.jwt.signAsync(accessPayload, {
            secret: this.accessTokenSecret,
            expiresIn: this.accessTokenExpires / 1000,
         }),
         this.jwt.signAsync(refreshPayload, {
            secret: this.refreshTokenSecret,
            expiresIn: this.refreshTokenExpires / 1000,
         }),
      ]);

      res.cookie('refresh_token', refreshToken, {
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

   private async validateVerifyToken(token: string) {
      try {
         return this.jwt.verifyAsync(token, {
            secret: this.verifyTokenSecret,
         });
      } catch (error) {
         throw new InvalidVerificationTokenException();
      }
   }
}
