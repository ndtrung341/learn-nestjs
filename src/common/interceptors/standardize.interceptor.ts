import { RESPONSE_MESSAGE_KEY } from '@common/decorators/response-message.decorator';
import {
   CallHandler,
   ExecutionContext,
   Injectable,
   NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';

type StandardResponse<T> = {
   status: number; // HTTP status code
   message: string; // Human-readable status message
   data: T | null; // Main response payload
   meta?: any; // Pagination, filtering, etc.
   timestamp: string; // ISO timestamp of the response
};

/**
 * Transforms response data into a consistent structure with status, code, message, data, and metadata
 */
@Injectable()
export class StandardizeTrInterceptor implements NestInterceptor {
   constructor(private reflector: Reflector) {}

   intercept(
      context: ExecutionContext,
      next: CallHandler<any>,
   ): Observable<StandardResponse<any>> {
      const response = context.switchToHttp().getResponse();

      const message = this.reflector.get(
         RESPONSE_MESSAGE_KEY,
         context.getHandler(),
      );

      return next.handle().pipe(
         map((responseData) => {
            let data;
            let meta;

            if (responseData && typeof responseData === 'object') {
               // Assign data and meta from responseData
               data = responseData.data ?? responseData;
               meta = responseData.meta ?? undefined;
            } else {
               // Handle primitive data types
               data = responseData;
            }

            return {
               status: response.statusCode,
               message: message || responseData?.message,
               data,
               meta,
               timestamp: new Date().toISOString(),
            };
         }),
      );
   }
}
