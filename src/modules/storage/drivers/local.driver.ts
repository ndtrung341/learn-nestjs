import { join } from 'path';
import {
   LocalDriverOptions,
   StorageDriver,
} from '../interfaces/storage.interface';
import { mkdir, unlink } from 'fs/promises';
import { pipeline } from 'stream';
import { createWriteStream } from 'fs';

export class LocalDriver implements StorageDriver {
   constructor(private options: LocalDriverOptions) {}

   async save(file: Express.Multer.File, folder: string) {
      const uploadDir = join(this.options.root, folder);
      await mkdir(uploadDir, { recursive: true });

      return new Promise<string>((resolve, reject) => {
         const filePath = join(uploadDir, file.filename);
         return pipeline(file.stream, createWriteStream(filePath), (err) => {
            return err ? reject(err) : resolve(filePath);
         });
      });
   }

   async delete(path: string) {
      return unlink(path);
   }
}
