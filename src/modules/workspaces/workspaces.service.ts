import { Injectable } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { DataSource, EntityManager, Repository } from 'typeorm';
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
import { Transaction } from '@common/decorators/transaction.decorator';

@Injectable()
export class WorkspacesService {
   constructor(
      @InjectRepository(WorkspaceEntity)
      private workspaceRepository: Repository<WorkspaceEntity>,
      @InjectRepository(WorkspaceMemberEntity)
      private workspaceMemberRepository: Repository<WorkspaceMemberEntity>,
   ) {}

   @Transaction()
   async create(userId: string, createWorkspaceDto: CreateWorkspaceDto) {
      const uniqueSlug = await this.generateUniqueSlug(createWorkspaceDto.name);

      const newWorkspace = await this.workspaceRepository.save({
         name: createWorkspaceDto.name,
         slug: uniqueSlug,
         description: createWorkspaceDto.description,
         visibility: WorkspaceVisibility.PRIVATE,
      });

      await this.workspaceMemberRepository.insert({
         userId,
         workspace: newWorkspace,
         role: WorkspaceMemberRole.ADMIN,
      });

      return newWorkspace;
   }

   async findOne(workspaceId: string) {
      return this.workspaceRepository.findOne({
         where: { id: workspaceId },
         relations: { members: { user: true } },
      });
   }

   private async generateUniqueSlug(workspaceName: string) {
      const baseSlug = slugify(workspaceName);

      const existingSlugNumbersQuery = this.workspaceRepository
         .createQueryBuilder()
         .select(
            `CAST(COALESCE(NULLIF(SUBSTRING(slug, LENGTH(:baseSlug) + 1),''),'0') AS INTEGER)`,
            'number',
         )
         .where(`slug LIKE :pattern`)
         .setParameters({
            baseSlug,
            pattern: `${baseSlug}%`,
         })
         .orderBy('number');

      const { nextAvailableNumber } = await this.workspaceRepository
         .createQueryBuilder()
         .addCommonTableExpression(
            existingSlugNumbersQuery,
            'existing_slug_numbers',
         )
         .select('COALESCE(MIN(current.number), -1) + 1', 'nextAvailableNumber')
         .from('existing_slug_numbers', 'current')
         .leftJoin(
            'existing_slug_numbers',
            'next',
            'next.number = current.number + 1',
         )
         .where('next.number IS NULL')
         .getRawOne();

      return nextAvailableNumber
         ? `${baseSlug}${nextAvailableNumber}`
         : baseSlug;
   }
}

// WITH slug_nums AS (
// 	SELECT
// 		CAST(COALESCE(NULLIF(SUBSTRING(slug, LENGTH('this-is-slug') + 1),''),'0') AS INTEGER) AS num
// 	FROM workspace
// 	WHERE slug LIKE 'this-is-slug' || '%'
// 	ORDER BY num
// )
// SELECT COALESCE(MIN(curr.num), 0) + 1 FROM slug_nums AS curr
// LEFT JOIN slug_nums AS next
// ON  next.num = curr.num + 1
// WHERE next.num IS NULL
