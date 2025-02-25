import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class BasicDatabaseService implements OnModuleInit {
   constructor(
      @Inject('DATABASE_CONFIG')
      private readonly config: any,
   ) {}

   async onModuleInit() {
      await this.connect();
   }

   private async connect(): Promise<void> {
      try {
         // Simulate database connection
         console.log('Database connected successfully:', {
            host: this.config.host,
            port: this.config.port,
            username: this.config.username,
            database: this.config.database,
         });
      } catch (error) {
         console.error('Database connection failed:', error);
         throw error;
      }
   }
}
