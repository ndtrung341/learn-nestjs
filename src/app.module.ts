import {
   MiddlewareConsumer,
   Module,
   NestModule,
   RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';
import { MailModule } from '@modules/mail/mail.module';

import { LoggerService } from '@common/services/logger.service';
import { ApiTrackerService } from '@common/services/api-tracker.service';
import { AuthMiddleware } from '@common/middlewares/auth.middleware';
import configuration from '@config/configuration';
import { BasicDatabaseModule } from './database/basic-database.module';

@Module({
   imports: [
      ConfigModule.forRoot({
         isGlobal: true,
         load: [configuration],
         cache: true,
         expandVariables: true,
      }),

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
            password: configService.get<string>('database.password')!,
            database: configService.get<string>('database.database')!,
         }),
      }),
   ],
   controllers: [AppController],
   providers: [AppService, LoggerService, ApiTrackerService],
})
export class AppModule implements NestModule {
   configure(consumer: MiddlewareConsumer) {
      // consumer
      //    .apply(AuthMiddleware)
      //    .exclude({ path: 'auth/*path', method: RequestMethod.ALL })
      //    .forRoutes({
      //       path: '*',
      //       method: RequestMethod.ALL,
      //    });
   }
}
