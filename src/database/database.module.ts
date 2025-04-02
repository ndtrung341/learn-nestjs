import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from './database.service';
import { DataSource } from 'typeorm';
import { setDataSource } from '@utils/data-source';

@Module({
   imports: [
      TypeOrmModule.forRootAsync({
         useClass: DatabaseService,
         dataSourceFactory: async (options) => {
            return setDataSource(new DataSource(options));
         },
      }),
   ],
   exports: [DatabaseModule],
})
export class DatabaseModule {}
