import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@auth/auth.module';
import { MailModule } from '@modules/mail/mail.module';

import configuration from '@config/configuration';
import { BasicDatabaseModule } from './db/basic-database.module';

import { CommonModule } from '@common/common.module';

@Module({
   imports: [
      ConfigModule.forRoot({
         isGlobal: true,
         load: [configuration],
         cache: true,
         expandVariables: true,
      }),
      CommonModule,
      UsersModule,
      AuthModule,

      //  MailModule.register({
      //    from: 'noreply@example.com',
      //    replyTo: 'support@example.com',
      //    provider: 'sendgrid',
      //    apiKey: 'XXX-XXX-XXX',
      //    isGlobal: true,
      //  }),

      MailModule.registerAsync({
         isGlobal: true,
         imports: [ConfigModule],
         inject: [ConfigService],
         useFactory: async (configService: ConfigService) => ({
            from: configService.get('MAIL_FROM', 'noreply@example.com'),
            replyTo: configService.get('MAIL_REPLY_TO', 'support@example.com'),
            provider: configService.get('MAIL_PROVIDER', 'sendgrid'),
            apiKey: configService.get('MAIL_API_KEY', 'XXX-XXX-XXX'),
         }),
      }),

      BasicDatabaseModule.forRootAsync({
         inject: [ConfigService],
         useFactory: async (configService: ConfigService) => ({
            host: configService.get('database.host')!,
            port: +configService.get('database.port')!,
            username: configService.get('database.username')!,
            password: configService.get('database.password')!,
            database: configService.get('database.database')!,
         }),
      }),
   ],
   controllers: [AppController],
   providers: [AppService],
})
export class AppModule {}
