import { PipeTransform, UnprocessableEntityException } from '@nestjs/common';
import { unlink } from 'fs/promises';

export class FileValidatorPipe implements PipeTransform {
   constructor(
      private options: { maxSize?: number; fileType?: string | RegExp },
   ) {}

   async transform(value: any) {
      if (Array.isArray(value)) {
         await Promise.all(value.map((f) => this.validate(f)));
      } else {
         await this.validate(value);
      }

      return value;
   }

   protected async validate(file: any) {
      try {
         this.validateFileSize(file);
         this.validateFileType(file);
      } catch (error) {
         await unlink(file.path);
         throw new UnprocessableEntityException(error);
      }
   }

   private validateFileSize(file: any) {
      if (this.options.maxSize && file.size > this.options.maxSize) {
         throw new Error(
            `File size exceeds the limit of ${this.options.maxSize} bytes`,
         );
      }
      return true;
   }

   private validateFileType(file: any) {
      if (
         this.options.fileType &&
         new RegExp(this.options.fileType).test(file.mimetype) === false
      ) {
         throw new Error(
            `Invalid file type. Expected: ${this.options.fileType}`,
         );
      }
      return true;
   }
}
