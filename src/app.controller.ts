import {
   Controller,
   Get,
   Req,
   UseGuards,
   UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from '@auth/guards/local-auth.guard';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { LoggerInterceptor } from '@common/interceptors/logger.interceptor';
import { CurrentUser } from '@common/decorators/current-user.decorator';

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
   testLocal(@CurrentUser() user) {
      return user;
   }

   @Get('test-passport-jwt')
   @UseGuards(JwtAuthGuard)
   testJwt(@Req() request) {
      return request.user;
   }
}
