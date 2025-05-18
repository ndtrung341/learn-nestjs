import { BadRequestException } from '@nestjs/common';
import {
   CloudinaryDriverOptions,
   StorageDriver,
} from '../interfaces/storage.interface';
import { v2 as cloudinary } from 'cloudinary';

export class CloudinaryDriver implements StorageDriver {
   constructor(options: CloudinaryDriverOptions) {
      cloudinary.config({
         api_key: options.apiKey,
         api_secret: options.apiSecret,
         cloud_name: options.cloudName,
      });
   }

   async save(file: Express.Multer.File, folder: string) {
      return new Promise<string>((resolve, reject) => {
         const uploadStream = cloudinary.uploader.upload_stream(
            {
               asset_folder: folder,
               public_id: file.filename.split('.')[0],
            },
            (error, result) => {
               return error ? reject(error) : resolve(result.secure_url);
            },
         );

         file.stream.pipe(uploadStream);
      });
   }

   async delete(url: string) {
      return new Promise<void>((resolve, reject) => {
         const publicId = this.extractPublicId(url);

         if (!publicId) {
            return reject(new BadRequestException('Invalid Cloudinary URL'));
         }

         cloudinary.uploader.destroy(publicId, resolve);
      });
   }

   private extractPublicId(url: string): string {
      const regex = /^.+cloudinary\.com(.+\/)(\w+)\.(\w+)$/;
      const matches = url.match(regex);
      return matches?.[2];
   }
}
