import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from '../services/auth.service';

@Controller('auth/microsoft')
@UseGuards(AuthGuard('microsoft'))
export class MicrosoftAuthController {
   constructor(private readonly authService: AuthService) {}

   @Get()
   @UseGuards(AuthGuard('microsoft'))
   async microsoftLogin() {
      // This route will handle the Microsoft OAuth flow
   }

   @Get('redirect')
   async microsoftRedirect(@Req() req: any, @Res() res: Response) {
      const redirectURL = await this.authService.handleOAuthLogin(
         'microsoft',
         req.user,
         res,
      );

      return res.redirect(redirectURL);
   }
}
