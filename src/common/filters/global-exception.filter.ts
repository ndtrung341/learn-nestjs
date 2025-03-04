import {
   type ExceptionFilter,
   type ArgumentsHost,
   HttpException,
   HttpStatus,
   Catch,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
   catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();

      // Default values for unknown errors
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Internal server error';
      let code = 'INTERNAL_SERVER_ERROR';
      let details = undefined;

      // Handle HttpExceptions
      if (exception instanceof HttpException) {
         status = exception.getStatus();
         const exceptionResponse = exception.getResponse();

         if (typeof exceptionResponse === 'string') {
            message = exceptionResponse;
         } else if (typeof exceptionResponse === 'object') {
            const exceptionObj = exceptionResponse as Record<string, any>;
            message = exceptionObj.message || message;
            code = exceptionObj.code;
            details = exceptionObj.details;
         }
      }

      console.error('[Exception]', {
         status,
         message,
         code,
         stack: exception instanceof Error ? exception.stack : undefined,
      });

      // Send the response
      const errorResponse = {
         status: 'error',
         statusCode: status,
         message,
         code,
         details,
         timestamp: new Date().toISOString(),
      };

      response.status(status).json(errorResponse);
   }
}
