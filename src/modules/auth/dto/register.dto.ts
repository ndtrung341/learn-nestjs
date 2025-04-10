import { FieldMatch } from '@decorators/validators/field-match.decorator';
import {
   IsEmail,
   IsNotEmpty,
   IsString,
   IsStrongPassword,
   MaxLength,
} from 'class-validator';

export class RegisterDto {
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

   @IsString()
   @FieldMatch('password')
   @IsNotEmpty()
   confirmPassword: string;
}
