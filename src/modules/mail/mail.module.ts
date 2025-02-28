import { DynamicModule, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendGridClient } from './clients/sendgrid.client';
import { MailTrapClient } from './clients/mailtrap.client';
import {
   IMailConfig,
   MailModuleAsyncOptions,
   MailModuleOptions,
} from './mail.interface';
import { ProviderToken } from 'constants/provider-token';

@Module({})
export class MailModule {
   private static readonly commonProviders = [
      MailService,
      {
         provide: ProviderToken.MAIL_SERVICE_ALIAS,
         useExisting: MailService,
      },
      {
         provide: ProviderToken.MAIL_CLIENT,
         useFactory: (config: IMailConfig) =>
            MailModule.createMailClient(config),
         inject: [ProviderToken.MAIL_CONFIG],
      },
   ];

   private static readonly exportsList = [
      MailService,
      ProviderToken.MAIL_SERVICE_ALIAS,
   ];

   private static createMailClient(config: IMailConfig) {
      return config.provider === 'sendgrid'
         ? new SendGridClient()
         : new MailTrapClient();
   }

   static register({
      isGlobal,
      ...mailConfig
   }: MailModuleOptions): DynamicModule {
      return {
         module: MailModule,
         global: isGlobal,
         providers: [
            ...this.commonProviders,
            {
               provide: ProviderToken.MAIL_CONFIG,
               useValue: mailConfig,
            },
         ],
         exports: this.exportsList,
      };
   }

   static registerAsync(options: MailModuleAsyncOptions): DynamicModule {
      return {
         module: MailModule,
         imports: options.imports,
         global: options.isGlobal,
         providers: [
            ...this.commonProviders,
            {
               provide: ProviderToken.MAIL_CONFIG,
               useFactory: options.useFactory,
               inject: options.inject || [],
            },
         ],
         exports: this.exportsList,
      };
   }
}
