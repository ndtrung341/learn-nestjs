import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './services/auth.service';
import { ApiPublic } from '@common/decorators/http.decorators';

@Controller('auth')
export class AuthController {
   constructor(private readonly authService: AuthService) {}

   @ApiPublic({
      message: 'Login successful',
   })
   @Post('login')
   login(@Body() loginDto: LoginDto) {
      return this.authService.login(loginDto);
   }

   @ApiPublic({
      message: 'User registered successfully. Please verify your email',
      statusCode: HttpStatus.CREATED,
   })
   @Post('register')
   register(@Body() registerDto: RegisterDto) {
      return this.authService.register(registerDto);
   }

   @ApiPublic({
      message: 'Email verified successfully',
   })
   @Get('verify-email/:token')
   verifyEmail(@Param('token') token: string) {
      return this.authService.verifyEmail(token);
   }
}
