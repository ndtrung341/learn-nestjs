import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {
   constructor(private configService: ConfigService) {}

   createTypeOrmOptions(): TypeOrmModuleOptions {
      return {
         type: this.configService.get('db.type'),
         host: this.configService.get('db.host'),
         port: this.configService.get('db.port'),
         username: this.configService.get('db.username'),
         password: this.configService.get('db.password') as any,
         database: this.configService.get('db.database'),
         synchronize: false,
         entities: [__dirname + '/../**/*.entity{.ts,.js}'],
         autoLoadEntities: false,
         migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
         migrationsRun: false,
         migrationsTableName: 'migrations',
      } as TypeOrmModuleOptions;
   }
}
