import {
   type CallHandler,
   type ExecutionContext,
   type NestInterceptor,
   PayloadTooLargeException,
   mixin,
   Type,
   UnsupportedMediaTypeException,
   BadRequestException,
} from '@nestjs/common';
import Busboy from 'busboy';
import type { Request } from 'express';
import { fileTypeFromBuffer } from 'file-type';
import Stream from 'stream';
export type UploadField = { name: string; maxCount?: number };
import mime from 'mime';
import { slugify } from '@utils/string';

export type ValidatorConfig = {
   fileSize?: number;
   fileSizeMessage?: string;
   fileType?: string | RegExp;
   fileTypeMessage?: string;
};

export type FileInfo = Express.Multer.File;

export function FormDataInterceptor(
   nameOrField?: string | UploadField | UploadField[],
   validator?: ValidatorConfig,
): Type<NestInterceptor> {
   class MixinInterceptor implements NestInterceptor {
      private fields: Record<string, any>;
      private filesLeft: Map<string, number>;
      private files: FileInfo[];
      private pendings: Promise<void>[];

      async intercept(context: ExecutionContext, next: CallHandler<any>) {
         const request = context.switchToHttp().getRequest<Request>();

         if (request.is('multipart/form-data')) {
            await this.parseFormData(request);
         }

         return next.handle();
      }

      get uploadMode() {
         if (!nameOrField) return null;
         else if (typeof nameOrField == 'string') return 'single';
         else if (Array.isArray(nameOrField)) return 'fields';
         return 'array';
      }

      private initialize() {
         this.fields = {};
         this.files = [];
         this.filesLeft = new Map();
         this.pendings = [];

         if (this.uploadMode == 'single') {
            this.filesLeft.set(nameOrField as string, 1);
         } else if (this.uploadMode == 'array') {
            const { name, maxCount = Infinity } = nameOrField as UploadField;
            this.filesLeft.set(name, maxCount);
         } else if (this.uploadMode == 'fields') {
            (nameOrField as UploadField[]).forEach((field) => {
               const { name, maxCount = Infinity } = field;
               this.filesLeft.set(name, maxCount);
            });
         }
      }

      private parseFormData(request: Request): Promise<void> {
         this.initialize();

         const busboy = Busboy({
            headers: request.headers,
            limits: { fileSize: validator?.fileSize },
         });

         return new Promise((resolve, reject) => {
            busboy.on('field', (fieldname, value) => {
               this.fields[fieldname] = value;
            });

            busboy.on('file', (fieldname, file, info) => {
               // Skip files for fields we're not expecting
               if (!this.filesLeft.has(fieldname)) {
                  return file.resume();
               }

               try {
                  // Check and update file count limits
                  this.updateFileLimit(fieldname);

                  //Process the file
                  const pending = this.loadFile(fieldname, file, info).catch(
                     (error) => reject(error),
                  );

                  this.pendings.push(pending);
               } catch (error) {
                  file.resume();
                  reject(error);
               }
            });

            busboy.on('finish', () => {
               return Promise.all(this.pendings)
                  .then(() => {
                     request.body = this.fields;
                     switch (this.uploadMode) {
                        case 'single':
                           request.file = this.files[0];
                           break;
                        case 'array':
                           request.files = this.files;
                           break;
                        case 'fields':
                           request.files = {};
                           this.files.forEach((file) => {
                              request.files[file.fieldname] ??= [];
                              request.files[file.fieldname].push(file);
                           });
                           break;
                     }
                     resolve();
                  })
                  .catch((error) => reject(error))
                  .finally(() => {
                     request.unpipe(busboy);
                     busboy.removeAllListeners();
                  });
            });

            busboy.on('error', reject);

            request.pipe(busboy);
         });
      }

      private loadFile(
         fieldname: string,
         file: Stream.Readable,
         info: Busboy.FileInfo,
      ): Promise<void> {
         return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];

            // Collect file data
            file.on('data', (chunk) => chunks.push(chunk));

            // Handle file size limit exceeded
            file.on('limit', () => {
               const error = new PayloadTooLargeException(
                  validator.fileSizeMessage || `File too large`,
               );
               reject(error);
            });

            // Handle errors in the stream
            file.on('error', (error) => reject(error));

            // Process completed file
            file.on('end', async () => {
               try {
                  const buffer = Buffer.concat(chunks);

                  await this.validateFileType(buffer, info.mimeType);

                  const extension = mime.extension(info.mimeType);
                  const basename = info.filename.split('.')[0];
                  const filename = `${Date.now()}_${slugify(basename, '_')}.${extension}`;

                  this.files.push({
                     fieldname,
                     originalname: info.filename,
                     mimetype: info.mimeType,
                     filename,
                     buffer,
                     size: buffer.length,
                  } as FileInfo);

                  resolve();
               } catch (error) {
                  reject(error);
               }
            });
         });
      }

      private updateFileLimit(fieldname: string) {
         const current = this.filesLeft.get(fieldname);
         if (current <= 0) {
            throw new BadRequestException('Too many files');
         }
         this.filesLeft.set(fieldname, current - 1);
      }

      private async validateFileType(
         buffer: Buffer,
         mimeType: string,
      ): Promise<boolean> {
         const error = new UnsupportedMediaTypeException(
            validator?.fileTypeMessage || `File type is not supported`,
         );

         if (!validator?.fileType) {
            return true;
         }

         const regex = new RegExp(validator.fileType);

         if (!regex.test(mimeType)) {
            throw error;
         }

         const fileType = await fileTypeFromBuffer(buffer);
         if (!fileType) {
            return true;
         }

         if (fileType.mime !== mimeType || !regex.test(fileType.mime)) {
            throw error;
         }
         return true;
      }
   }

   return mixin(MixinInterceptor);
}
