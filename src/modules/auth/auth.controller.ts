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
import { JwtPayload } from './types/jwt-payload.type';

@Controller('auth')
export class AuthController {
   constructor(private readonly authService: AuthService) {}

   @ApiPublic({
      message: 'Login successful',
   })
   @Post('login')
   login(
      @Body() loginDto: LoginDto,
      @Res({ passthrough: true }) res: Response,
   ) {
      return this.authService.login(loginDto, res);
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
   @Get('verify')
   verifyEmail(@Query('token') token: string) {
      return this.authService.verifyEmail(token);
   }

   @UseGuards(JwtRefreshGuard)
   @ApiPublic()
   @Post('refresh')
   refresh(@CurrentUser() user: JwtPayload) {
      return this.authService.refreshToken(user);
   }
}
