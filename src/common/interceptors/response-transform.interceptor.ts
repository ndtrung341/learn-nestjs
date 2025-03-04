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

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
   constructor(private reflector: Reflector) {}

   intercept(context: ExecutionContext, next: CallHandler<any>) {
      const message = this.reflector.get(
         RESPONSE_MESSAGE_KEY,
         context.getHandler(),
      );
      const response = context.switchToHttp().getResponse<Response>();
      const statusCode = response.statusCode;

      return next.handle().pipe(
         map((responseData) => {
            let data: any = null;
            let meta: any = null;

            if (responseData && typeof responseData === 'object') {
               // Assign data and meta from responseData
               data = responseData.data ?? responseData;
               meta = responseData.meta;
            } else {
               // Handle primitive data types
               data = responseData;
            }

            return {
               status: 'success',
               statusCode,
               message: message || responseData?.message,
               data,
               meta,
               timestamp: new Date().toISOString(),
            };
         }),
      );
   }
}
