import {
   IsNotEmpty,
   IsString,
   IsStrongPassword,
   IsUUID,
} from 'class-validator';

export class ResetPasswordDto {
   @IsUUID()
   @IsNotEmpty()
   token: string;

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
}
