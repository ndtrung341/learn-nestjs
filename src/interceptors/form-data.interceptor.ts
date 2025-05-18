import {
   type CallHandler,
   type ExecutionContext,
   type NestInterceptor,
   mixin,
   Type,
} from '@nestjs/common';
import Busboy from 'busboy';
import type { Request } from 'express';
import { slugify } from '@utils/string';
import {
   FileTooLargeException,
   FileUnsupportedTypeException,
   TooManyFilesException,
} from '@exceptions/file.exception';
import { pipeline } from 'node:stream/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createReadStream, createWriteStream } from 'node:fs';
import { unlink } from 'node:fs/promises';

type UploadField = { name: string; maxCount?: number };

type UploadOptions = {
   maxFileSize?: number;
   allowedFileType?: string | RegExp;
};

export function FormDataInterceptor(
   name?: string | UploadField | UploadField[],
   options: UploadOptions = {},
): Type<NestInterceptor> {
   function getLimits() {
      const limits = new Map<string, number>();

      if (!name) return limits;

      if (typeof name === 'string') {
         limits.set(name, 1);
      } else if ('name' in name) {
         limits.set(name.name, name.maxCount || Infinity);
      } else {
         name.forEach((f) => limits.set(f.name, f.maxCount || Infinity));
      }

      return limits;
   }

   class MixinInterceptor implements NestInterceptor {
      private files: Express.Multer.File[];
      private fields: Record<string, any>;
      private limits: Map<string, number>;

      async intercept(context: ExecutionContext, next: CallHandler<any>) {
         const req = context.switchToHttp().getRequest<Request>();

         if (req.is('multipart/form-data')) {
            this.files = [];
            this.fields = {};
            this.limits = getLimits();

            await this.handleMultipart(req);
         }

         return next.handle();
      }

      private async handleMultipart(req: Request) {
         const busboy = Busboy({
            headers: req.headers,
            limits: { fileSize: options.maxFileSize },
         });

         const parsing = new Promise((resolve, reject) => {
            req.on('aborted', () => reject(new Error('Request aborted')));
            req.on('error', reject);
            busboy.on('error', reject);
            busboy.on('finish', resolve);
         });

         req.pipe(busboy);

         try {
            await Promise.all([
               this.collectFiles(busboy),
               this.collectFields(busboy),
               parsing,
            ]);
            this.attachToRequest(req);
         } catch (error) {
            req.unpipe(busboy);
            req.on('readable', () => req.read());
            busboy.removeAllListeners();
            await this.cleanupFiles();
            throw error;
         }
      }

      private cleanupFiles() {
         return Promise.all(this.files.map((file) => unlink(file.path)));
      }

      private collectFiles(busboy: Busboy.Busboy) {
         return new Promise((resolve, reject) => {
            busboy.on('file', (fieldname, fileStream, info) => {
               let limit = this.limits.get(fieldname);

               if (limit === undefined) {
                  fileStream.resume();
                  return;
               }

               const filename = this.createFilename(info.filename);
               const file = {
                  fieldname,
                  originalname: info.filename,
                  mimetype: info.mimeType,
                  filename,
                  path: join(tmpdir(), filename),
               } as Express.Multer.File;

               this.files.push(file);
               this.limits.set(fieldname, --limit);

               fileStream.once('readable', () => {
                  if (!info.mimeType.match(options.allowedFileType)) {
                     fileStream.destroy(new FileUnsupportedTypeException());
                  }

                  if (limit < 0) {
                     fileStream.destroy(new TooManyFilesException());
                  }
               });

               fileStream.on('limit', () => {
                  fileStream.destroy(new FileTooLargeException());
               });

               const output = createWriteStream(file.path);
               pipeline(fileStream, output)
                  .then(() => (file.size = output.bytesWritten))
                  .catch(reject);
            });
            busboy.on('finish', resolve);
         });
      }

      private collectFields(busboy: Busboy.Busboy) {
         return new Promise((resolve, reject) => {
            busboy.on('field', (fieldname, value) => {
               this.fields[fieldname] = value;
            });
            busboy.on('finish', resolve);
         });
      }

      private attachToRequest(req: Request) {
         req.body = this.fields;

         if (!this.files.length) return;

         for (const file of this.files) {
            file.stream = createReadStream(file.path);
            file.stream.on('open', () => unlink(file.path));
         }

         if (typeof name === 'string') {
            req.file = this.files[0];
         } else if (!Array.isArray(name) && name?.name) {
            req.files = this.files;
         } else {
            req.files = {};
            this.files.forEach((file) => {
               req.files[file.fieldname] ??= [];
               req.files[file.fieldname].push(file);
            });
         }
      }

      private createFilename(originalname: string) {
         const [basename, extension] = originalname.split(/(\.\w+)$/);
         return `${Date.now()}_${slugify(basename, '_')}${extension}`;
      }
   }

   return mixin(MixinInterceptor);
}
