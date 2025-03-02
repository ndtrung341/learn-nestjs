import {
   ArgumentsHost,
   ExceptionFilter,
   HttpException,
   HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

export class GlobalExceptionFilter implements ExceptionFilter {
   catch(exception: any, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let message: string = 'Internal server error';
      let errors: any[] = [];

      if (exception instanceof HttpException) {
         statusCode = exception.getStatus();
         const response = exception.getResponse() as any;

         if (typeof response === 'string') {
            message = response;
         } else {
            message = response.message || message;
            errors = response.errors || [];
         }
      }

      const errorResponse: any = {
         status: 'error',
         message,
         path: request.url,
         timestamp: new Date().toISOString(),
      };

      if (errors.length > 0) {
         errorResponse.errors = errors;
      }

      response.status(statusCode).json(errorResponse);
   }
}
