import { DataSource } from 'typeorm';

export interface DataSourceOptions {
   name?: string;
   dataSource: DataSource;
}

const dataSources = new Map<string, DataSource>();

export function setDataSource(options: DataSource | DataSourceOptions) {
   const { name = 'default', dataSource } =
      options instanceof DataSource ? { dataSource: options } : options;

   if (dataSources.has(name)) {
      throw new Error(`DataSource "${name}" already exists`);
   }

   dataSources.set(name, dataSource);
   return dataSource;
}

export function getDataSource(name: string = 'default') {
   if (!dataSources.has(name)) {
      throw new Error(`DataSource "${name}" not initialized`);
   }
   return dataSources.get(name);
}
