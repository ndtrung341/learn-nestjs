import {
   CallHandler,
   ExecutionContext,
   Injectable,
   NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { map, Observable } from 'rxjs';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
   intercept(
      context: ExecutionContext,
      next: CallHandler<any>,
   ): Observable<any> | Promise<Observable<any>> {
      const response: Response = context.switchToHttp().getResponse();

      return next.handle().pipe(
         map((data) => ({
            message: data.message || '',
            data: data.data || data,
            timestamp: new Date().toISOString(),
         })),
      );
   }
}
