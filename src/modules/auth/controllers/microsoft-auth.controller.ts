import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Controller('auth/microsoft')
@UseGuards(AuthGuard('microsoft'))
export class MicrosoftAuthController {
   constructor(
      private readonly authService: AuthService,
      private readonly configService: ConfigService,
   ) {}

   @Get()
   @UseGuards(AuthGuard('microsoft'))
   async microsoftLogin() {
      // This route will handle the Microsoft OAuth flow
   }

   @Get('redirect')
   async microsoftRedirect(@Req() req: any, @Res() res: Response) {
      const { accessToken, expiresIn } =
         await this.authService.handleGoogleAuth(req.user, res);

      const frontendRedirect = `${this.configService.get(
         'FRONTEND_URL',
      )}/auth/callback?token=${accessToken}&expires=${expiresIn}`;

      return res.redirect('/api');
      return res.redirect(frontendRedirect);
   }
}
