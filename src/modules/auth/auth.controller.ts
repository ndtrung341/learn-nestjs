import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './services/auth.service';
import { LoggerService } from '@common/services/logger.service';

@Controller('auth')
export class AuthController {
   constructor(
      private authService: AuthService,
      private logger: LoggerService,
   ) {}

   @Post('login')
   async login(@Body() loginDto: LoginDto) {
      const result = await this.authService.login(loginDto);
      this.logger.info(result);
      return {
         message: 'Login successful',
         data: result,
      };
   }

   @Post('register')
   async register(@Body() registerDto: RegisterDto) {
      await this.authService.register(registerDto);
      return {
         message:
            'Registration successful. Please check your email for verification.',
      };
   }

   @Get('verify/:token')
   async verifyEmail(@Param('token') token: string) {
      await this.authService.verifyEmail(token);
      return {
         message: 'Email verified successfully.',
      };
   }
}
