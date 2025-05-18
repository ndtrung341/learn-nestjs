import {
   Body,
   Controller,
   Get,
   HttpStatus,
   Post,
   Res,
   UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { CurrentUser } from '@decorators/current-user.decorator';
import { ProtectedRoute, PublicRoute } from '@decorators/http.decorators';

import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';

import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

import { AuthService } from '../services/auth.service';

import { JwtRefreshPayload } from '../interfaces/payload.interface';
import { PasswordResetService } from '../services/password-reset.service';

@Controller('auth')
export class AuthController {
   constructor(
      private authService: AuthService,
      private passwordResetService: PasswordResetService,
   ) {}

   @Post('login')
   @PublicRoute('Login successful')
   async login(
      @Body() loginDto: LoginDto,
      @Res({ passthrough: true }) res: Response,
   ) {
      return this.authService.login(loginDto, res);
   }

   @Post('register')
   @PublicRoute({
      statusCode: HttpStatus.CREATED,
      message: 'User registered successfully. Please verify your email',
   })
   async register(@Body() registerDto: RegisterDto) {
      return this.authService.register(registerDto);
   }

   @Post('verify')
   @PublicRoute('Email verified successfully')
   async verifyEmail(@Body('token') token: string) {
      return this.authService.verifyEmail(token);
   }

   @Post('refresh')
   @UseGuards(JwtRefreshGuard)
   async refresh(
      @CurrentUser() payload: JwtRefreshPayload,
      @Res({ passthrough: true }) res: Response,
   ) {
      const { sub: userId, session: sessionId, token } = payload;
      return this.authService.refreshTokens(userId, sessionId, token, res);
   }

   @Get('logout')
   @ProtectedRoute('User logged out successfully')
   async logout(
      @CurrentUser('session') sessionId: string,
      @Res({ passthrough: true }) res: Response,
   ) {
      return this.authService.logout(sessionId, res);
   }

   @Get('me')
   @ProtectedRoute()
   getCurrentUser(@CurrentUser('sub') id: string) {
      return this.authService.getCurrentUser(id);
   }

   @Post('forgot-password')
   @PublicRoute(
      'If your email is registered, you will receive a password reset link',
   )
   forgotPassword(@Body() dto: ForgotPasswordDto) {
      return this.passwordResetService.forgotPassword(dto.email);
   }

   @Post('reset-password')
   @PublicRoute('Password has been reset successfully')
   resetPassword(@Body() dto: ResetPasswordDto) {
      return this.passwordResetService.resetPassword(dto.token, dto.password);
   }
}
