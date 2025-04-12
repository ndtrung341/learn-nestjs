import { Optional } from '@nestjs/common';
import {
   IsEmail,
   IsNotEmpty,
   IsOptional,
   IsString,
   IsStrongPassword,
   MaxLength,
} from 'class-validator';

export class CreateUserDto {
   @IsEmail()
   @IsNotEmpty()
   email: string;

   @IsString()
   @MaxLength(50)
   @IsNotEmpty()
   firstName: string;

   @IsString()
   @MaxLength(50)
   @IsNotEmpty()
   lastName: string;

   @IsString()
   @IsNotEmpty()
   @IsStrongPassword({
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
   })
   password: string;

   @Optional()
   emailVerified?: boolean;

   @IsString()
   @IsOptional()
   bio?: string;

   @IsString()
   @MaxLength(255)
   @IsOptional()
   image?: string;
}
