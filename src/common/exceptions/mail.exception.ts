import { BadRequestException } from '@nestjs/common';

export class MailSendFailedException extends BadRequestException {
   constructor(message: string = 'Failed to send verification email') {
      super(message);
   }
}
