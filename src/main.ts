import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseTransformInterceptor } from '@common/interceptors/response-transform.interceptor';

async function bootstrap() {
   const app = await NestFactory.create(AppModule);

   app.setGlobalPrefix('api');

   const reflector = app.get(Reflector);
   app.useGlobalInterceptors(new ResponseTransformInterceptor(reflector));

   app.useGlobalPipes(
      new ValidationPipe({
         transform: true,
         whitelist: true,
      }),
   );

   await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
