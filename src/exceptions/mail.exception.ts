import { BaseException } from './base.exception';
import { HttpStatus } from '@nestjs/common';

export class MailSendFailedException extends BaseException {
   constructor(message: string = 'Failed to send mail') {
      super(message, HttpStatus.BAD_REQUEST, 'MAIL_SEND_FAILED');
   }
}
