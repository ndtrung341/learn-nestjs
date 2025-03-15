import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Controller()
export class AppController {
   constructor(private readonly appService: AppService) {}

   @Get()
   getHello(): string {
      return this.appService.getHello();
   }
}
