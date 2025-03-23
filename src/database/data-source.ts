import { DataSource, DataSourceOptions } from 'typeorm';

export const AppDataSource = new DataSource({
   type: process.env.DB_TYPE,
   host: process.env.DB_HOST,
   port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
   username: process.env.DB_USERNAME,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME,
   synchronize: false,
   entities: [__dirname + '/../**/*.entity{.ts,.js}'],
   autoLoadEntities: false,
   migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
   migrationsRun: false,
   migrationsTableName: 'migrations',
} as DataSourceOptions);
