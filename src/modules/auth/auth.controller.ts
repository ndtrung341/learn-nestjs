import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './services/auth.service';
import { ResponseMessage } from '@common/decorators/response-message.decorator';

@Controller('auth')
export class AuthController {
   constructor(private readonly authService: AuthService) {}

   @Post('signin')
   @ResponseMessage('Login successful.')
   login(@Body() loginDto: LoginDto) {
      return this.authService.signin(loginDto);
   }

   @Post('signup')
   @ResponseMessage('User registered successfully. Please verify your email.')
   register(@Body() registerDto: RegisterDto) {
      return this.authService.signup(registerDto);
   }

   @Get('verify-email/:token')
   @ResponseMessage('Email verified successfully.')
   verifyEmail(@Param('token') token: string) {
      return this.authService.verifyEmail(token);
   }
}
