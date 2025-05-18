export abstract class StorageDriver {
   abstract save(file: Express.Multer.File, folder: string): Promise<string>;
   abstract delete(path: string): Promise<void>;
}

export enum StorageType {
   LOCAL = 'local',
   CLOUDINARY = 'cloudinary',
   S3 = 's3',
}

export interface LocalDriverOptions {
   root?: string;
}

export interface CloudinaryDriverOptions {
   cloudName: string;
   apiKey: string;
   apiSecret: string;
}

export interface S3DriverOptions {
   bucketName: string;
   accessKeyId: string;
   secretAccessKey: string;
   region: string;
}

export type StorageModuleOptions =
   | { type: StorageType.LOCAL; options: LocalDriverOptions }
   | { type: StorageType.S3; options: S3DriverOptions }
   | { type: StorageType.CLOUDINARY; options: CloudinaryDriverOptions };

export type StorageModuleAsyncOptions = {
   useFactory: (...args: any[]) => StorageModuleOptions;
   imports?: any[];
   inject?: any[];
};
