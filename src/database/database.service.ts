import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import {} from '../modules/users/entities/user.entity';

@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {
   constructor(private configService: ConfigService) {}

   createTypeOrmOptions(): TypeOrmModuleOptions {
      return {
         type: this.configService.get('db.type'),
         host: this.configService.get('db.host'),
         port: this.configService.get('db.port'),
         username: this.configService.get('db.username'),
         password: this.configService.get('db.password'),
         database: this.configService.get('db.database'),
         synchronize: true,
         entities: [__dirname + '/../**/*.entity{.ts, .js}'],
         autoLoadEntities: true,
      } as TypeOrmModuleOptions;
   }
}
