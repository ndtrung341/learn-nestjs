import { DataSource } from 'typeorm';

export abstract class Seeder {
   static async run(dataSource: DataSource): Promise<any> {}
}
