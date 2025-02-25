import { Expose } from 'class-transformer';
import { IsDateString, IsMobilePhone, IsOptional } from 'class-validator';

export class PersonalDto {
   @Expose()
   @IsOptional()
   @IsMobilePhone('vi-VN')
   phone?: string;

   @Expose()
   @IsOptional()
   @IsDateString()
   dateOfBirth?: string;
}
