import { RESPONSE_MESSAGE_KEY } from '@common/decorators/response-message.decorator';
import {
   CallHandler,
   ExecutionContext,
   Injectable,
   NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map } from 'rxjs';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
   constructor(private reflector: Reflector) {}

   intercept(context: ExecutionContext, next: CallHandler<any>) {
      const message = this.reflector.get(
         RESPONSE_MESSAGE_KEY,
         context.getHandler(),
      );

      return next.handle().pipe(
         map((responseData) => {
            const response: any = {
               status: 'success',
               timestamp: new Date().toISOString(),
            };

            if (message) {
               response.message = message;
            }

            if (responseData && typeof responseData === 'object') {
               // Assign data and meta from responseData
               response.data = responseData.data ?? responseData;
               if (responseData.meta) {
                  response.meta = responseData.meta;
               }
            } else {
               // Handle primitive data types
               response.data = responseData;
            }

            return response;
         }),
      );
   }
}
