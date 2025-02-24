import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';

// Register exceptions
export class EmailAlreadyExistsException extends ConflictException {
  constructor(message: string = 'Email already exists') {
    super(message);
  }
}

// Login exceptions
export class InvalidCredentialsException extends UnauthorizedException {
  constructor(message: string = 'Invalid email or password') {
    super(message);
  }
}

export class EmailNotVerifiedException extends BadRequestException {
  constructor(message: string = 'Email is not verified') {
    super(message);
  }
}

// Verification exceptions
export class InvalidVerificationTokenException extends BadRequestException {
  constructor(message: string = 'Invalid or expired verification token') {
    super(message);
  }
}

export class EmailAlreadyVerifiedException extends BadRequestException {
  constructor(message: string = 'Email has already been verified') {
    super(message);
  }
}

// Token exceptions
export class MissingTokenException extends UnauthorizedException {
  constructor(message: string = 'Authorization token is missing') {
    super(message);
  }
}

export class InvalidTokenException extends UnauthorizedException {
  constructor(message: string = 'Token is invalid or expired') {
    super(message);
  }
}
