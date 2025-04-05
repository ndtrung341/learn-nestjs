import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkspaceDto } from './create-workspace.dto';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { slugify } from '@utils/string';
import { WorkspaceVisibility } from '../entities/workspace.entity';

export class UpdateWorkspaceDto extends PartialType(CreateWorkspaceDto) {
   @Transform(({ value }) => slugify(value))
   @IsString()
   @IsNotEmpty()
   slug: string;

   @IsEnum(WorkspaceVisibility)
   @IsNotEmpty()
   value: WorkspaceVisibility;
}
