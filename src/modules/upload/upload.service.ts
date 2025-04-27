import { Inject, Injectable } from '@nestjs/common';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class UploadService {
   constructor(@Inject('UPLOAD_CONFIG') private uploadConfig) {}

   async save(file: Buffer, name: string, dest?: string) {
      const destination = dest || this.uploadConfig.dest;
      await mkdir(destination, { recursive: true });

      const filePath = join(destination, name);
      await writeFile(filePath, file);

      return filePath.replace(/\\/g, '/');
   }

   async delete(path: string) {
      return unlink(path);
   }
}
