import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class ProfessionalDto {
  @Expose()
  @IsOptional()
  @IsString()
  position?: string;

  @Expose()
  @IsOptional()
  @IsString()
  company?: string;
}
