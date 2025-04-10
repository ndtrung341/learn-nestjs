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

export class EmailAlreadyVerifiedException extends BaseException {
   constructor() {
      super(
         'Email has already been verified',
         HttpStatus.BAD_REQUEST,
         'EMAIL_ALREADY_VERIFIED',
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

export class SessionNotFoundException extends BaseException {
   constructor() {
      super('Session not found', HttpStatus.NOT_FOUND, 'SESSION_NOT_FOUND');
   }
}

export class SessionBlacklistedException extends BaseException {
   constructor() {
      super(
         'Session is blacklisted',
         HttpStatus.UNAUTHORIZED,
         'SESSION_BLACKLISTED',
      );
   }
}

export class SessionInvalidException extends BaseException {
   constructor() {
      super('Session is invalid', HttpStatus.UNAUTHORIZED, 'SESSION_INVALID');
   }
}
