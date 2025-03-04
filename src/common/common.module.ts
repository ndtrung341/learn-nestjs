import { Global, Module } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ResponseTransformInterceptor } from './interceptors/response-transform.interceptor';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { CustomValidationPipe } from './pipes/custom-validation.pipe';

@Global()
@Module({
   providers: [
      LoggerService,
      {
         provide: APP_INTERCEPTOR,
         useClass: ResponseTransformInterceptor,
      },
      {
         provide: APP_FILTER,
         useClass: GlobalExceptionFilter,
      },
      {
         provide: APP_PIPE,
         useClass: CustomValidationPipe,
      },
   ],
   exports: [LoggerService],
})
export class CommonModule {}
