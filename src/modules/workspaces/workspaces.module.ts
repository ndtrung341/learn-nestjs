import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceEntity } from './entities/workspace.entity';
import { WorkspaceMemberEntity } from './entities/workspace-member.entity';

@Module({
   imports: [
      TypeOrmModule.forFeature([WorkspaceEntity, WorkspaceMemberEntity]),
   ],
   controllers: [WorkspacesController],
   providers: [WorkspacesService],
})
export class WorkspacesModule {}
