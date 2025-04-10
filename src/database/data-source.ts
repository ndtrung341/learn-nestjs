import { DataSource, DataSourceOptions } from 'typeorm';
import { NamingStrategy } from './naming.strategy';
import { SeederOptions } from 'typeorm-extension';

export const AppDataSource = new DataSource({
   type: process.env.DB_TYPE,
   host: process.env.DB_HOST,
   port: parseInt(process.env.DB_PORT || '5432', 10),
   username: process.env.DB_USERNAME,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME,
   synchronize: false,
   entities: [__dirname + '/../**/*.entity{.ts,.js}'],
   autoLoadEntities: false,
   namingStrategy: new NamingStrategy(),
   migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
   migrationsRun: false,
   migrationsTableName: 'migrations',
   seedTracking: false,
   seeds: [__dirname + '/seeds/**/*{.ts,.js}'],
   factories: [__dirname + '/factories/**/*{.ts,.js}'],
} as DataSourceOptions & SeederOptions);
