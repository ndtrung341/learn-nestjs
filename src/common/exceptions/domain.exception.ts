export class DomainException extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class UserNotFound extends DomainException {
  constructor() {
    super('User not found.');
  }
}

export class EmailAlreadyExists extends DomainException {
  constructor() {
    super('Email already exists.');
  }
}

export class InvalidCredentials extends DomainException {
  constructor() {
    super('Invalid email or password');
  }
}

export class MailSendFailed extends DomainException {
  constructor(message: string = 'Failed to send email') {
    super(message);
  }
}

export class InvalidVerificationToken extends Error {
  constructor() {
    super('Invalid or expired verification token');
  }
}

export class EmailAlreadyVerified extends Error {
  constructor() {
    super('Email has already been verified');
  }
}

export class EmailNotVerified extends Error {
  constructor() {
    super('Please verify your email before logging in');
  }
}
