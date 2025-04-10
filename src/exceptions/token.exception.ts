import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class MissingTokenException extends BaseException {
   constructor() {
      super(
         'Authorization token is missing',
         HttpStatus.UNAUTHORIZED,
         'MISSING_TOKEN',
      );
   }
}

export class InvalidTokenException extends BaseException {
   constructor() {
      super(
         'Token is invalid or expired',
         HttpStatus.UNAUTHORIZED,
         'INVALID_TOKEN',
      );
   }
}

export class InvalidVerificationTokenException extends BaseException {
   constructor() {
      super(
         'Invalid or expired verification token',
         HttpStatus.BAD_REQUEST,
         'INVALID_VERIFICATION_TOKEN',
      );
   }
}

export class InvalidResetPasswordTokenException extends BaseException {
   constructor() {
      super(
         'Invalid or expired reset password token',
         HttpStatus.BAD_REQUEST,
         'INVALID_VERIFICATION_TOKEN',
      );
   }
}
