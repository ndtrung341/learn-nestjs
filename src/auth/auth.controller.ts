import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  EmailAlreadyExists,
  EmailNotVerified,
  InvalidCredentials,
  UserNotFound,
} from 'src/common/exceptions/domain.exception';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await this.authService.login(loginDto);
      return {
        message: 'Login successful',
        user: result,
      };
    } catch (error) {
      switch (error.constructor) {
        case InvalidCredentials:
          throw new UnauthorizedException(error.message);
        case EmailNotVerified:
          throw new BadRequestException(error.message);
        default:
          throw new InternalServerErrorException('Something went wrong');
      }
    }
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      await this.authService.register(registerDto);
      return {
        message:
          'Registration successful. Please check your email for verification.',
      };
    } catch (error) {
      switch (error.constructor) {
        case EmailAlreadyExists:
          throw new ConflictException(error.message);
        default:
          throw new InternalServerErrorException('Something went wrong');
      }
    }
  }

  @Get('verify/:token')
  async verifyEmail(@Param('token') token: string) {
    try {
      await this.authService.verifyEmail(token);
      return {
        message: 'Email verified successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Something went wrong',
      );
    }
  }
}
