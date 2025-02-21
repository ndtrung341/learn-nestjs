import {
  Body,
  ConflictException,
  Controller,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  EmailAlreadyExistsException,
  InvalidPasswordException,
  UserNotFoundException,
} from 'src/common/exceptions/domain.exception';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await this.authService.login(loginDto);
      return result;
    } catch (error) {
      if (
        error instanceof UserNotFoundException ||
        error instanceof InvalidPasswordException
      ) {
        throw new UnauthorizedException('Invalid email or password');
      }
    }
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      const result = await this.authService.register(registerDto);
      return result;
    } catch (error) {
      if (error instanceof EmailAlreadyExistsException) {
        throw new ConflictException(error.message);
      }

      console.log(error);
    }
  }
}
