import { Injectable } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
   WorkspaceEntity,
   WorkspaceVisibility,
} from './entities/workspace.entity';
import {
   WorkspaceMemberEntity,
   WorkspaceMemberRole,
} from './entities/workspace-member.entity';
import { slugify } from '@utils/string';

@Injectable()
export class WorkspacesService {
   constructor(
      @InjectRepository(WorkspaceEntity)
      private workspaceRepository: Repository<WorkspaceEntity>,
      @InjectRepository(WorkspaceMemberEntity)
      private memberRepository: Repository<WorkspaceMemberEntity>,
   ) {}

   async create(userId, dto: CreateWorkspaceDto) {
      const workspace = await this.workspaceRepository.save({
         name: dto.name,
         slug: slugify(dto.name),
         description: dto.description,
         visibility: WorkspaceVisibility.PRIVATE,
      });

      await this.memberRepository.insert({
         userId,
         workspace,
         role: WorkspaceMemberRole.ADMIN,
      });

      return workspace;
   }

   async findOne(id: string) {
      const workspace = await this.workspaceRepository.findOne({
         where: { id },
         relations: { members: { user: true } },
      });

      return workspace;
   }
}
