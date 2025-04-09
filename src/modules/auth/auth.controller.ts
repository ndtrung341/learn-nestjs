import {
   Body,
   Controller,
   Get,
   HttpStatus,
   Post,
   Query,
   Res,
   UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ApiPrivate, ApiPublic } from '@common/decorators/http.decorators';

import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import { AuthService } from './auth.service';

import { JwtRefreshPayload } from './types/jwt-payload.type';

@Controller('auth')
export class AuthController {
   constructor(private readonly authService: AuthService) {}

   @Post('login')
   @ApiPublic({
      message: 'Login successful',
   })
   async login(
      @Body() loginDto: LoginDto,
      @Res({ passthrough: true }) res: Response,
   ) {
      return this.authService.login(loginDto, res);
   }

   @Post('register')
   @ApiPublic({
      statusCode: HttpStatus.CREATED,
      message: 'User registered successfully. Please verify your email',
   })
   async register(@Body() registerDto: RegisterDto) {
      return this.authService.register(registerDto);
   }

   @Post('verify')
   @ApiPublic({
      message: 'Email verified successfully',
   })
   async verifyEmail(@Body('token') token: string) {
      return this.authService.verifyEmail(token);
   }

   @Post('refresh')
   @UseGuards(JwtRefreshGuard)
   @ApiPublic()
   async refresh(
      @CurrentUser() payload: JwtRefreshPayload,
      @Res({ passthrough: true }) res: Response,
   ) {
      const { sub: userId, session: sessionId, token } = payload;
      return this.authService.refreshTokens(userId, sessionId, token, res);
   }

   @Get('logout')
   @ApiPrivate({ message: 'User logged out successfully' })
   async logout(
      @CurrentUser('session') sessionId: string,
      @Res({ passthrough: true }) res: Response,
   ) {
      return this.authService.logout(sessionId, res);
   }

   @Get('me')
   @ApiPrivate()
   getCurrentUser(@CurrentUser('sub') id: string) {
      return this.authService.getCurrentUser(id);
   }

   @Post('forgot-password')
   @ApiPublic({ message: 'Password reset email has been sent.' })
   forgotPassword(@Body() dto: ForgotPasswordDto) {
      return this.authService.initiatePasswordReset(dto.email);
   }

   @Post('reset-password')
   @ApiPublic({ message: 'Reset password successfully' })
   resetPassword(@Body() dto: ResetPasswordDto) {
      return this.authService.completePasswordReset(dto.token, dto.password);
   }
}
