import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from '@filters/global-exception.filter';
import { CamelSnakeInterceptor } from '@interceptors/camel-snake.interceptor';
import { StandardizeTrInterceptor } from '@interceptors/standardize.interceptor';
import {
   ClassSerializerInterceptor,
   UnprocessableEntityException,
   ValidationPipe,
} from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import path from 'path';

async function bootstrap() {
   const app = await NestFactory.create<NestExpressApplication>(AppModule);

   const config = app.get(ConfigService);
   const reflector = app.get(Reflector);

   app.use(cookieParser());
   app.useStaticAssets(path.join(__dirname, '..', 'assets'), {
      prefix: '/assets',
   });

   app.setGlobalPrefix(config.get('app.prefix'));

   app.useGlobalInterceptors(
      new CamelSnakeInterceptor(),
      new StandardizeTrInterceptor(reflector),
      new ClassSerializerInterceptor(reflector),
   );
   app.useGlobalPipes(
      new ValidationPipe({
         whitelist: true,
         transform: true,
         exceptionFactory(errors) {
            throw new UnprocessableEntityException(errors);
         },
      }),
   );
   app.useGlobalFilters(new GlobalExceptionFilter(config));

   await app.listen(config.get('app.port') ?? 3000);

   console.info(`Server running on ${await app.getUrl()}`);
}
bootstrap();
