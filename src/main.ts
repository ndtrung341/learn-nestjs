import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ResponseTransformInterceptor } from '@common/interceptors/response-transform.interceptor';
import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';

async function bootstrap() {
   const app = await NestFactory.create(AppModule);

   app.setGlobalPrefix('api');

   const reflector = app.get(Reflector);

   app.useGlobalInterceptors(new ResponseTransformInterceptor(reflector));
   app.useGlobalFilters(new GlobalExceptionFilter());
   app.useGlobalPipes(
      new ValidationPipe({
         transform: true,
         whitelist: true,
         exceptionFactory(errors) {
            const errorDetails = errors.map((error) => ({
               field: error.property,
               message: Object.values(error.constraints || {}),
            }));

            return new BadRequestException({
               message: 'Validation failed',
               errors: errorDetails,
            });
         },
      }),
   );

   await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
