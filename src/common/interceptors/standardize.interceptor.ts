import { RESPONSE_MESSAGE_KEY } from '@common/decorators/response-message.decorator';
import {
   CallHandler,
   ExecutionContext,
   Injectable,
   NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { map } from 'rxjs';

/**
 * Interceptor that standardizes API response format
 * Transforms response data into a consistent structure with status, code, message, data, and metadata
 */
@Injectable()
export class StandardizeTrInterceptor implements NestInterceptor {
   constructor(private reflector: Reflector) {}

   intercept(context: ExecutionContext, next: CallHandler<any>) {
      const response = context.switchToHttp().getResponse<Response>();

      const message = this.reflector.get(
         RESPONSE_MESSAGE_KEY,
         context.getHandler(),
      );

      return next.handle().pipe(
         map((responseData) => {
            let data: any = null;
            let meta: any = {};

            if (responseData && typeof responseData === 'object') {
               // Assign data and meta from responseData
               data = responseData.data ?? responseData;
               meta = responseData.meta;
            } else {
               // Handle primitive data types
               data = responseData;
               meta = undefined;
            }

            return {
               status: 'success',
               status_code: response.statusCode,
               message: message || responseData?.message,
               data,
               meta,
               timestamp: new Date().toISOString(),
            };
         }),
      );
   }
}
