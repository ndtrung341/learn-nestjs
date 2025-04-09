import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkspaceDto } from './create-workspace.dto';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { WorkspaceVisibility } from '../entities/workspace.entity';

export class UpdateWorkspaceDto extends PartialType(CreateWorkspaceDto) {
   @IsEnum(WorkspaceVisibility)
   @IsNotEmpty()
   visibility: WorkspaceVisibility;
}
