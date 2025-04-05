import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { DataSource, Like, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
   WorkspaceEntity,
   WorkspaceVisibility,
} from './entities/workspace.entity';
import {
   WorkspaceMemberEntity,
   WorkspaceMemberRole,
} from './entities/workspace-member.entity';
import { Transaction } from '@common/decorators/transaction.decorator';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspacesService {
   constructor(
      private readonly dataSource: DataSource,
      @InjectRepository(WorkspaceEntity)
      private readonly workspaceRepo: Repository<WorkspaceEntity>,
      @InjectRepository(WorkspaceMemberEntity)
      private readonly memberRepo: Repository<WorkspaceMemberEntity>,
   ) {}

   async findWorkspaceById(id: string) {
      return this.workspaceRepo.findOne({
         where: { id },
         relations: {
            members: {
               user: true,
            },
         },
      });
   }

   @Transaction()
   async createWorkspace(ownerId: string, dto: CreateWorkspaceDto) {
      const workspace = await this.workspaceRepo.save({
         name: dto.name,
         description: dto.description,
         visibility: WorkspaceVisibility.PRIVATE,
      });

      await this.memberRepo.insert({
         userId: ownerId,
         workspace,
         role: WorkspaceMemberRole.ADMIN,
      });

      return workspace;
   }

   async updateWorkspace(id: string, dto: UpdateWorkspaceDto) {
      const workspace = await this.workspaceRepo.findOneBy({ id });

      if (!workspace) {
         throw new NotFoundException('Workspace not found');
      }

      return this.workspaceRepo.save({ ...workspace, ...dto });
   }
}
