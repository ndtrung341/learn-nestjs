import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth/google')
@UseGuards(AuthGuard('google'))
export class GoogleAuthController {
   constructor(
      private readonly authService: AuthService,
      private readonly configService: ConfigService,
   ) {}

   @Get()
   async googleLogin() {
      // This route will handle the Google OAuth flow
   }

   @Get('redirect')
   async googleRedirect(@Req() req: any, @Res() res: Response) {
      const redirectURL = await this.authService.handleOAuthLogin(
         'google',
         req.user,
         res,
      );

      return res.redirect(redirectURL);
   }
}
