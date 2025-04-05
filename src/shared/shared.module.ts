import { Global, Module, ValidationPipe } from '@nestjs/common';
import { LoggerService } from '../shared/services/logger.service';
import { SnowflakeService } from './services/snowflake.service';

@Global()
@Module({
   providers: [LoggerService, SnowflakeService],
   exports: [LoggerService, SnowflakeService],
})
export class SharedModule {}
