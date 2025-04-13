import { AuthGuard } from '@nestjs/passport';

export class MicrosoftGuard extends AuthGuard('microsoft') {}
