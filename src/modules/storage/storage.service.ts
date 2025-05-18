import { Inject, Injectable } from '@nestjs/common';
import { StorageDriver } from './interfaces/storage.interface';

@Injectable()
export class StorageService implements StorageDriver {
   constructor(
      @Inject('STORAGE_DRIVER')
      private driver: StorageDriver,
   ) {}

   async save(file: Express.Multer.File, subDir?: string) {
      return this.driver.save(file, subDir);
   }

   async delete(filePath: string) {
      return this.driver.delete(filePath);
   }
}
