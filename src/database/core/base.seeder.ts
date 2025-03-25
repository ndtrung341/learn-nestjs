import { DataSource } from 'typeorm';

export abstract class BaseSeeder {
   constructor(protected dataSource: DataSource) {}

   abstract run(): Promise<void>;
}
