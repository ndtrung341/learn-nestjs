import { Global, Module } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './interceptors/transform.interceptor';

@Global()
@Module({
   providers: [
      { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
      LoggerService,
   ],
   exports: [LoggerService],
})
export class CommonModule {}
