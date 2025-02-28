import {
   CallHandler,
   ExecutionContext,
   Injectable,
   NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { LoggerService } from '@common/services/logger.service';
import { Request } from 'express';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
   constructor(private readonly logger: LoggerService) {}

   intercept(
      context: ExecutionContext,
      next: CallHandler<any>,
   ): Observable<any> | Promise<Observable<any>> {
      const request: Request = context.switchToHttp().getRequest();
      const { method, url } = request;
      const start = Date.now();

      this.logger.info('Incoming Request', {
         method,
         url,
      });

      return next.handle().pipe(
         tap(() => {
            const timeElapsed = Date.now() - start;
            this.logger.info('Request Completed', {
               method,
               url,
               timeElapsed: `${timeElapsed}ms`,
            });
         }),
      );
   }
}
