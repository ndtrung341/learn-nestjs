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

export class MailSendFailed extends DomainException {
  constructor(message: string = 'Failed to send email') {
    super(message);
  }
}
