import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseException extends HttpException {
   constructor(
      message: string,
      status: HttpStatus,
      code: string,
      details?: any,
   ) {
      super({ message, code, details }, status);
   }
}
