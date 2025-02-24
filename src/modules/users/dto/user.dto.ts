import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { ProfessionalDto } from './professional.dto';
import { PersonalDto } from './personal.dto';

export class UserDto {
  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;

  @ValidateNested()
  @Type(() => PersonalDto)
  personal?: PersonalDto;

  @ValidateNested()
  @Type(() => ProfessionalDto)
  professional?: ProfessionalDto;
}
