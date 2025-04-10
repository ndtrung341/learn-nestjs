import {
   type ExceptionFilter,
   type ArgumentsHost,
   HttpException,
   HttpStatus,
   Catch,
   UnprocessableEntityException,
} from '@nestjs/common';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';
import { ValidationError } from 'class-validator';
import type { Response } from 'express';
import { STATUS_CODES } from 'http';
import { CONSTRAINT_ERRORS } from '@constants/constraint-errors.constant';
import { snakeCase } from '@utils/string';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@constants/app.constants';

type ErrorResponse = {
   status: number; // HTTP status code
   error: string; // HTTP status text
   message: string; // User-friendly error message
   timestamp: string; // ISO timestamp when error occurred
   details?: any; // Additional error details (optional)
};

/**
 * Global exception filter to handle all exceptions
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
   private isDebug = false;

   constructor(private configService: ConfigService) {
      this.isDebug =
         configService.get('app.environment') === Environment.DEVELOPMENT;
   }

   catch(exception: any, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();

      let errorResponse: ErrorResponse;

      if (exception instanceof UnprocessableEntityException) {
         errorResponse = this.handleUnprocessableEntityException(exception);
      } else if (exception instanceof HttpException) {
         errorResponse = this.handleHttpException(exception);
      } else if (exception instanceof QueryFailedError) {
         errorResponse = this.handleQueryFailedError(exception);
      } else if (exception instanceof EntityNotFoundError) {
         errorResponse = this.handleEntityNotFoundError(exception);
      } else {
         errorResponse = this.handleError(exception);
      }

      if (this.isDebug) {
         console.debug(exception.stack);
      }

      response.status(errorResponse.status).json(errorResponse);
   }

   /**
    * Handle generic errors (fallback)
    */
   private handleError(error: Error): ErrorResponse {
      const status = HttpStatus.INTERNAL_SERVER_ERROR;

      return {
         status,
         error: STATUS_CODES[status],
         message: error.message || 'An unexpected error occurred',
         timestamp: new Date().toISOString(),
      };
   }

   /**
    * Handle HTTP exceptions
    */
   private handleHttpException(exception: HttpException): ErrorResponse {
      const status = exception.getStatus();

      const response = exception.getResponse();
      const message = (
         typeof response === 'object' && 'message' in response
            ? response.message
            : response
      ) as string;

      return {
         status,
         error: STATUS_CODES[status],
         message,
         timestamp: new Date().toISOString(),
      };
   }

   /**
    * Handle validation errors
    */
   private handleUnprocessableEntityException(
      exception: UnprocessableEntityException,
   ): ErrorResponse {
      const status = exception.getStatus();

      const response = exception.getResponse() as {
         message: ValidationError[];
      };

      return {
         status,
         error: STATUS_CODES[status],
         message: 'Validation failed',
         details: this.extractValidationErrors(response.message),
         timestamp: new Date().toISOString(),
      };
   }

   /**
    * Handle database query failures
    */
   private handleQueryFailedError(exception: QueryFailedError): ErrorResponse {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Database operation failed';

      const { constraint } = exception as QueryFailedError & {
         constraint: string;
      };

      if (constraint?.startsWith('UQ')) {
         status = HttpStatus.CONFLICT;
         message = CONSTRAINT_ERRORS[constraint];
      }

      return {
         status,
         error: STATUS_CODES[status],
         message,
         timestamp: new Date().toISOString(),
      };
   }

   /**
    * Handle entity not found errors
    */
   private handleEntityNotFoundError(exception: EntityNotFoundError) {
      const status = HttpStatus.NOT_FOUND;

      return {
         status,
         error: STATUS_CODES[status],
         message: 'Entity not found',
         timestamp: new Date().toISOString(),
      };
   }

   /**
    * Extract validation errors
    */
   private extractValidationErrors(errors: ValidationError[]) {
      const extract = (error: ValidationError, path: string = '') => {
         const propertyName = snakeCase(error.property);
         const propertyPath = path ? `${path}.${propertyName}` : propertyName;

         const currentError = error?.constraints
            ? Object.entries(error.constraints)
                 .map(([constraint, message]) => ({
                    property: propertyPath,
                    message: message.replace(error.property, propertyName),
                 }))
                 .slice(0, 1)
            : [];

         const childsError = error.children?.length
            ? error.children.flatMap((child) => extract(child, propertyPath))
            : [];

         return [...currentError, ...childsError];
      };

      return errors.flatMap((error) => extract(error));
   }
}
