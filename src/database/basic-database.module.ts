import { DynamicModule, Module } from '@nestjs/common';
import { BasicDatabaseService } from './basic-database.service';

interface SimpleDatabaseConfig {
   host: string;
   port: number;
   username: number;
   password: string;
   database: string;
}

interface BasicDatabaseModuleAsyncOptions {
   useFactory: (
      ...args: any[]
   ) => Promise<SimpleDatabaseConfig> | SimpleDatabaseConfig;
   inject?: any[];
}

@Module({})
export class BasicDatabaseModule {
   static forRootAsync(
      options: BasicDatabaseModuleAsyncOptions,
   ): DynamicModule {
      return {
         global: true,
         module: BasicDatabaseModule,
         providers: [
            {
               provide: 'DATABASE_CONFIG',
               useFactory: options.useFactory,
               inject: options.inject,
            },
            BasicDatabaseService,
         ],
      };
   }
}
