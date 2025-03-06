import { FieldMatch } from '@common/decorators/field-match.decorator';
import {
   IsEmail,
   IsNotEmpty,
   IsString,
   IsStrongPassword,
} from 'class-validator';

export class RegisterDto {
   @IsEmail()
   @IsNotEmpty()
   email: string;

   @IsString()
   @IsNotEmpty()
   fullName: string;

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

   @IsString()
   @IsNotEmpty()
   @FieldMatch('password')
   confirmPassword: string;
}
