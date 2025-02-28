import { LoggerService } from '@common/services/logger.service';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class BasicDatabaseService implements OnModuleInit {
   constructor(
      @Inject('DATABASE_CONFIG')
      private readonly config: any,
      private readonly logger: LoggerService,
   ) {}

   async onModuleInit() {
      await this.connect();
   }

   private async connect(): Promise<void> {
      try {
         // Simulate database connection
         this.logger.info('Database connected successfully:', {
            host: this.config.host,
            port: this.config.port,
            username: this.config.username,
            database: this.config.database,
         });
      } catch (error) {
         this.logger.error('Database connection failed:', error);
         throw error;
      }
   }
}
