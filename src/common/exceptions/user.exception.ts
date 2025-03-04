import { BaseException } from './base.exception';
import { HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends BaseException {
   constructor() {
      super('User not found', HttpStatus.NOT_FOUND, 'USER_NOT_FOUND');
   }
}
