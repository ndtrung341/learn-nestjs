import { MailService } from '@modules/mail/mail.service';
import { UsersService } from '@modules/users/services/users.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createCacheKey } from '@utils/cache';
import { Cache } from 'cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { JwtResetPasswordPayload } from '../types/jwt-payload.type';
import { RedisStore } from 'cache-manager-ioredis-yet';

@Injectable()
export class PasswordResetService {
   private readonly resetSecret: string;
   private readonly resetExpires: number;
   private readonly PASSWORD_RESET_PREFIX = 'PASSWORD_RESET';

   constructor(
      private readonly usersService: UsersService,
      private readonly config: ConfigService,
      private readonly jwt: JwtService,
      private readonly mailer: MailService,
      @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
   ) {
      this.resetSecret = config.get('auth.resetPassword.secret');
      this.resetExpires = config.get('auth.resetPassword.expires');
   }

   /**
    * Initiates password reset process by sending an email with reset token
    */
   async forgotPassword(email: string) {
      const user = await this.usersService.findOneByEmail(email);
      if (!user) return;

      const jti = uuidv4();
      const cacheKey = createCacheKey(this.PASSWORD_RESET_PREFIX, email, jti);

      const [token] = await Promise.all([
         this.generateToken(email, jti),
         this.storeTokenInCache(cacheKey, true),
      ]);

      return this.mailer.sendPasswordResetEmail(email, token);
   }

   /**
    * Reset user's password after validating token
    */
   async resetPassword(token: string, newPassword: string) {
      const payload = await this.validateToken(token);
      await this.usersService.updatePassword(payload.sub, newPassword);
      await this.invalidateAllTokens(payload.sub);
   }

   /**
    * Validate a reset token
    */
   async validateToken(token: string) {
      const payload = await this.decodeToken(token);
      if (!payload) {
         throw new BadRequestException('Token is invalid or expired');
      }

      const cacheKey = createCacheKey(
         this.PASSWORD_RESET_PREFIX,
         payload.sub,
         payload.jti,
      );

      if (!(await this.hasTokenInCache(cacheKey))) {
         throw new BadRequestException('Token is invalid or expired');
      }

      return payload;
   }

   /**
    * Generate a JWT token with payload
    */
   private generateToken(email: string, jti: string) {
      return this.jwt.signAsync(
         { jti },
         {
            secret: this.resetSecret,
            subject: email,
            expiresIn: this.resetExpires / 1000,
         },
      );
   }

   /**
    * Decode and verifies a JWT token
    */
   private async decodeToken(token: string) {
      try {
         return await this.jwt.verifyAsync<JwtResetPasswordPayload>(token, {
            secret: this.resetSecret,
         });
      } catch (error) {
         return null;
      }
   }

   /**
    * Stores a token in cache with expiration
    */
   private storeTokenInCache(key: string, value: any) {
      return this.cacheManager.set(key, value, this.resetExpires * 1000);
   }

   /**
    * Check if a token exists in cache
    */
   private hasTokenInCache(key: string) {
      return this.cacheManager.get(key);
   }

   /**
    * Invalidate all reset tokens for a user
    */
   private async invalidateAllTokens(email: string) {
      const redisClient = (this.cacheManager.store as RedisStore).client;
      const keysToDelete = [];
      const pattern = createCacheKey(this.PASSWORD_RESET_PREFIX, email, '*');
      let cursor = '0';

      do {
         const [nextCursor, keys] = await redisClient.scan(
            cursor,
            'MATCH',
            pattern,
         );

         keysToDelete.push(...keys);
         cursor = nextCursor;
      } while (cursor !== '0');

      if (keysToDelete.length > 0) {
         await redisClient.del(keysToDelete);
      }

      return true;
   }
}
