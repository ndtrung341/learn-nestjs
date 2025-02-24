import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor(message: string = 'User not found') {
    super(message);
  }
}
