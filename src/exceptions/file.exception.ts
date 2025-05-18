import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class FileTooLargeException extends BaseException {
   constructor(message: string = 'File too large') {
      super(message, HttpStatus.PAYLOAD_TOO_LARGE, 'FILE_TOO_LARGE');
   }
}

export class FileUnsupportedTypeException extends BaseException {
   constructor(message: string = 'File type is not supported') {
      super(
         message,
         HttpStatus.UNSUPPORTED_MEDIA_TYPE,
         'FILE_TYPE_NOT_SUPPORTED',
      );
   }
}

export class TooManyFilesException extends BaseException {
   constructor(message: string = 'Too many files') {
      super(message, HttpStatus.BAD_REQUEST, 'TOO_MANY_FILES');
   }
}
