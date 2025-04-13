import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { GoogleProfile } from '../strategies/google.strategy';
import { AuthService } from '../auth.service';
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
   async googleRedirect(
      @Req() req: { user: GoogleProfile },
      @Res() res: Response,
   ) {
      const { accessToken, expiresIn } =
         await this.authService.handleGoogleAuth(req.user, res);

      const frontendRedirect = `${this.configService.get(
         'FRONTEND_URL',
      )}/auth/callback?token=${accessToken}&expires=${expiresIn}`;

      return res.redirect('/api');
      return res.redirect(frontendRedirect);
   }
}
