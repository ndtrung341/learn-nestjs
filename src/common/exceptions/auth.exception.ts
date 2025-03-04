import { BaseException } from './base.exception';
import { HttpStatus } from '@nestjs/common';

// Register exceptions
export class EmailAlreadyExistsException extends BaseException {
   constructor() {
      super(
         'Email already exists',
         HttpStatus.CONFLICT,
         'EMAIL_ALREADY_EXISTS',
      );
   }
}

// Login exceptions
export class InvalidCredentialsException extends BaseException {
   constructor() {
      super(
         'Invalid email or password',
         HttpStatus.UNAUTHORIZED,
         'INVALID_CREDENTIALS',
      );
   }
}

export class EmailNotVerifiedException extends BaseException {
   constructor() {
      super(
         'Email is not verified',
         HttpStatus.BAD_REQUEST,
         'EMAIL_NOT_VERIFIED',
      );
   }
}

// Verification exceptions
export class InvalidVerificationTokenException extends BaseException {
   constructor() {
      super(
         'Invalid or expired verification token',
         HttpStatus.BAD_REQUEST,
         'INVALID_VERIFICATION_TOKEN',
      );
   }
}

export class EmailAlreadyVerifiedException extends BaseException {
   constructor() {
      super(
         'Email has already been verified',
         HttpStatus.BAD_REQUEST,
         'EMAIL_ALREADY_VERIFIED',
      );
   }
}

// Token exceptions
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

export class AccessDeniedException extends BaseException {
   constructor(details?: Record<string, any>) {
      super(
         'You do not have permission to access this resource',
         HttpStatus.FORBIDDEN,
         'ACCESS_DENIED',
         details,
      );
   }
}
