import { DynamicModule, Module } from '@nestjs/common';
import {
   StorageModuleAsyncOptions,
   StorageModuleOptions,
   StorageType,
} from './interfaces/storage.interface';
import { LocalDriver } from './drivers/local.driver';
import { StorageService } from './storage.service';
import { CloudinaryDriver } from './drivers/cloudinary.driver';

@Module({})
export class StorageModule {
   static register(options: StorageModuleOptions): DynamicModule {
      const driver = {
         provide: 'STORAGE_DRIVER',
         useValue: StorageModule.createDriver(options),
      };

      return {
         module: StorageModule,
         providers: [driver, StorageService],
         exports: [StorageService],
      };
   }

   static registerAsync(options: StorageModuleAsyncOptions): DynamicModule {
      const driver = {
         provide: 'STORAGE_DRIVER',
         useFactory: (...args: any[]) => {
            const config = options.useFactory(...args);
            return StorageModule.createDriver(config);
         },
         inject: options.inject || [],
      };

      return {
         module: StorageModule,
         imports: options.imports || [],
         providers: [driver, StorageService],
         exports: [StorageService],
      };
   }

   private static createDriver(options: StorageModuleOptions) {
      switch (options.type) {
         case StorageType.LOCAL:
            return new LocalDriver(options.options);
         case StorageType.S3:
            return;
         case StorageType.CLOUDINARY:
            return new CloudinaryDriver(options.options);
         default:
            throw new Error('Unsupported storage');
      }
   }
}
