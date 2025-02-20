export class DomainException extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class UserNotFoundException extends DomainException {
  constructor() {
    super('User not found.');
  }
}

export class EmailAlreadyExistsException extends DomainException {
  constructor() {
    super('Email already exists.');
  }
}

export class InvalidPasswordException extends DomainException {
  constructor() {
    super('Password is incorrect.');
  }
}

export class MailSendException extends DomainException {
  constructor(message: string = 'Failed to send email') {
    super(message);
  }
}
