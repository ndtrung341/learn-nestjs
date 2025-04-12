import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { GoogleOAuthGuard } from '../guards/google.guard';
import { GoogleProfile } from '../strategies/google.strategy';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Controller('auth/google')
export class GoogleAuthController {
   constructor(
      private readonly authService: AuthService,
      private readonly configService: ConfigService,
   ) {}

   @Get()
   @UseGuards(GoogleOAuthGuard)
   async googleAuth() {
      // This route will handle the Google OAuth flow
   }

   @Get('redirect')
   @UseGuards(GoogleOAuthGuard)
   async googleAuthRedirect(
      @Req() req: { user: GoogleProfile },
      @Res() res: Response,
   ) {
      const { accessToken, expiresIn } =
         await this.authService.handleGoogleAuth(req.user, res);

      // const clientUrl = this.configService.get('app.clientUrl');
      // res.redirect(
      //    `${clientUrl}/auth/callback?access_token=${accessToken}&expires_in=${expiresIn}`,
      // );

      res.redirect('https://www.google.com');
   }
}
