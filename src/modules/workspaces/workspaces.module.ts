import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceEntity } from './entities/workspace.entity';
import { WorkspaceMemberEntity } from './entities/workspace-member.entity';
import { UsersModule } from '@modules/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailModule } from '@modules/mail/mail.module';
import { StorageModule } from '@modules/storage/storage.module';
import { StorageType } from '@modules/storage/interfaces/storage.interface';

@Module({
   imports: [
      TypeOrmModule.forFeature([WorkspaceEntity, WorkspaceMemberEntity]),
      JwtModule.registerAsync({
         inject: [ConfigService],
         useFactory: (config: ConfigService) => {
            const invitationConfig = config.get('app.invitation');
            return {
               secret: invitationConfig.secret,
               signOptions: {
                  expiresIn: invitationConfig.expiresIn,
               },
            };
         },
      }),
      UsersModule,
      MailModule,
      StorageModule.register({
         type: StorageType.LOCAL,
         options: { root: 'assets' },
      }),
   ],
   controllers: [WorkspacesController],
   providers: [WorkspacesService],
   exports: [WorkspacesService],
})
export class WorkspacesModule {}
