import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
   const app = await NestFactory.create(AppModule);

   // const reflector = app.get(Reflector);

   app.setGlobalPrefix('api');

   // app.useGlobalInterceptors(new ResponseTransformInterceptor(reflector));
   // app.useGlobalPipes(new CustomValidationPipe());
   // app.useGlobalFilters(new GlobalExceptionFilter())

   await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
