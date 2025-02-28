import {
   Controller,
   Get,
   Req,
   Scope,
   UseGuards,
   UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from '@auth/guards/local-auth.guard';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { LoggerInterceptor } from '@common/interceptors/logger.interceptor';

@Controller()
@UseInterceptors(LoggerInterceptor)
export class AppController {
   constructor(private readonly appService: AppService) {}

   @Get()
   getHello(): string {
      return this.appService.getHello();
   }

   @Get('test-passport-local')
   @UseGuards(LocalAuthGuard)
   testLocal(@Req() request) {
      return request.user;
   }

   @Get('test-passport-jwt')
   @UseGuards(JwtAuthGuard)
   testJwt(@Req() request) {
      return request.user;
   }
}
