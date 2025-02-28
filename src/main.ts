import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
   const app = await NestFactory.create(AppModule);

   // const logger = await app.resolve(LoggerService);
   // app.useGlobalInterceptors(new LoggerInterceptor(logger));

   app.useGlobalPipes(
      new ValidationPipe({
         transform: true,
         whitelist: true,
      }),
   );

   await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
