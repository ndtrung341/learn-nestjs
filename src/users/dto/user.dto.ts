import { Expose, Type } from 'class-transformer';
import { IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { ProfessionalDto } from './professional.dto';
import { PersonalDto } from './personal.dto';

export class UserDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  @IsOptional()
  @IsString()
  fullName: string;

  @Expose()
  @IsOptional()
  @IsString()
  bio?: string;

  @Expose()
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @Expose()
  @ValidateNested()
  @Type(() => PersonalDto)
  personal?: PersonalDto;

  @Expose()
  @ValidateNested()
  @Type(() => ProfessionalDto)
  professional?: ProfessionalDto;
}
