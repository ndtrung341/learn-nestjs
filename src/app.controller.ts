import { Controller, Get, Scope } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTrackerService } from './common/services/api-tracker.service';
import { LoggerService } from './common/services/logger.service';

@Controller({ scope: Scope.DEFAULT })
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly apiTracker: ApiTrackerService,
    private readonly logger: LoggerService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-1')
  async test1() {
    this.apiTracker.startTrack();
    await new Promise((resovle) => setTimeout(resovle, 2500));
    this.apiTracker.endTrack(true);
    this.logger.log(this.apiTracker.getRequestMetrics());
  }

  @Get('test-2')
  async test2() {
    this.apiTracker.startTrack();
    await new Promise((resovle) => setTimeout(resovle, 2000));
    this.apiTracker.endTrack(false);
  }
}
