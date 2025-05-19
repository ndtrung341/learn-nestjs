import { MailService } from '@modules/mail/mail.service';
import { UsersService } from '@modules/users/services/users.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtResetPasswordPayload } from '../interfaces/payload.interface';
import crypto from 'node:crypto';

@Injectable()
export class PasswordResetService {
   private readonly resetSecret: string;
   private readonly resetExpires: number;

   constructor(
      private usersService: UsersService,
      private jwt: JwtService,
      private mailer: MailService,
      config: ConfigService,
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

      const token = await this.jwt.signAsync(
         { hash: this.createHash(user.password) },
         {
            secret: this.resetSecret,
            subject: email,
            expiresIn: this.resetExpires / 1000,
         },
      );

      return this.mailer.sendPasswordResetEmail(email, token);
   }

   /**
    * Reset user's password after validating token
    */
   async resetPassword(token: string, newPassword: string) {
      const payload = await this.validateToken(token);
      return this.usersService.updatePassword(payload.sub, newPassword);
   }

   /**
    * Validate a reset token
    */
   async validateToken(token: string) {
      const payload = await this.decodeToken(token);
      if (!payload) {
         throw new BadRequestException('Token is invalid or expired');
      }

      const user = await this.usersService.findOneByEmail(payload.sub);
      if (!user || !this.compareHash(user.password, payload.hash)) {
         throw new BadRequestException('Token is invalid or expired');
      }

      return payload;
   }

   private createHash(value: string) {
      return crypto.createHash('sha256').update(value).digest('hex');
   }

   private compareHash(value: string, hash: string) {
      return crypto.timingSafeEqual(
         Buffer.from(this.createHash(value), 'hex'),
         Buffer.from(hash, 'hex'),
      );
   }

   private decodeToken(token: string) {
      try {
         return this.jwt.verifyAsync<JwtResetPasswordPayload>(token, {
            secret: this.resetSecret,
         });
      } catch (error) {
         return null;
      }
   }
}
