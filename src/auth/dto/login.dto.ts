import { PickType } from '@nestjs/mapped-types';
import { IsNotEmpty } from 'class-validator';
import { RegisterDto } from './register.dto';

export class LoginDto extends PickType(RegisterDto, ['email', 'password']) {
  @IsNotEmpty()
  password: string;
}
