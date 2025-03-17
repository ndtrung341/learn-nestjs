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
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { ApiPublic } from '@common/decorators/http.decorators';
import { Response } from 'express';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { JwtRefreshPayload } from './types/jwt-payload.type';

@Controller('auth')
export class AuthController {
   constructor(private readonly authService: AuthService) {}

   @Post('login')
   @ApiPublic({
      message: 'Login successful',
   })
   login(
      @Body() loginDto: LoginDto,
      @Res({ passthrough: true }) res: Response,
   ) {
      return this.authService.login(loginDto, res);
   }

   @Post('register')
   @ApiPublic({
      message: 'User registered successfully. Please verify your email',
      statusCode: HttpStatus.CREATED,
   })
   register(@Body() registerDto: RegisterDto) {
      return this.authService.register(registerDto);
   }

   @Get('verify')
   @ApiPublic({
      message: 'Email verified successfully',
   })
   verifyEmail(@Query('token') token: string) {
      return this.authService.verifyEmail(token);
   }

   @Post('refresh')
   @UseGuards(JwtRefreshGuard)
   @ApiPublic()
   refresh(
      @CurrentUser() payload: JwtRefreshPayload,
      @Res({ passthrough: true }) res: Response,
   ) {
      const { sub: userId, session: sessionId, jti } = payload;
      return this.authService.reissueTokens(userId, sessionId, jti, res);
   }
}
