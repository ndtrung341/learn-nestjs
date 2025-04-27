import { DynamicModule, Module } from '@nestjs/common';
import { UploadService } from './upload.service';

interface UploadModuleOptions {
   dest: string;
}

@Module({})
export class UploadModule {
   static register(options: UploadModuleOptions): DynamicModule {
      return {
         module: UploadModule,
         providers: [
            UploadService,
            {
               provide: 'UPLOAD_CONFIG',
               useValue: options,
            },
         ],
         exports: [UploadService],
      };
   }
}
