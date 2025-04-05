import { slugify } from '@utils/string';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWorkspaceDto {
   @IsString()
   @IsNotEmpty()
   name: string;

   @IsString()
   @IsOptional()
   description?: string;
}
