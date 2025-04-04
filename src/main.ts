import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';
import { CustomValidationPipe } from '@common/pipes/custom-validation.pipe';
import { AuthGuard } from '@modules/auth/guards/auth.guard';
import { CamelSnakeInterceptor } from '@common/interceptors/camel-snake.interceptor';
import { StandardizeTrInterceptor } from '@common/interceptors/standardize.interceptor';
import {
   ClassSerializerInterceptor,
   UnprocessableEntityException,
   ValidationPipe,
} from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
   const app = await NestFactory.create(AppModule);

   const config = app.get(ConfigService);
   const reflector = app.get(Reflector);

   app.use(cookieParser());

   app.setGlobalPrefix(config.get('app.prefix'));

   app.useGlobalGuards(new AuthGuard(reflector));
   app.useGlobalInterceptors(
      new CamelSnakeInterceptor(),
      new StandardizeTrInterceptor(reflector),
      new ClassSerializerInterceptor(reflector),
   );
   // app.useGlobalPipes(new CustomValidationPipe());
   app.useGlobalPipes(
      new ValidationPipe({
         whitelist: true,
         // transform: true,
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
