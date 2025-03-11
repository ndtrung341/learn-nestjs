import { Global, Module, ValidationPipe } from '@nestjs/common';
import { LoggerService } from '../shared/services/logger.service';

@Global()
@Module({
   providers: [LoggerService],
   exports: [LoggerService],
})
export class SharedModule {}
