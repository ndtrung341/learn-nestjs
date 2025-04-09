import {
   BadRequestException,
   CanActivate,
   ExecutionContext,
   Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InvitationTokenPayload } from '../types/invitation-payload';
import { Request } from 'express';

@Injectable()
export class InvitationGuard implements CanActivate {
   constructor(private readonly jwtService: JwtService) {}

   async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();
      const token = request.body['token'] as string;
      const currentUserId = request.user?.['sub'];

      if (!token) {
         throw new BadRequestException('Invalid or expired invitation token');
      }

      try {
         const payload = this.jwtService.verify<InvitationTokenPayload>(token);

         if (payload.userId !== currentUserId) {
            throw new BadRequestException(
               'Invalid or expired invitation token',
            );
         }

         request['invitation'] = payload;
         return true;
      } catch (error) {
         if (error instanceof BadRequestException) {
            throw error;
         }
         throw new BadRequestException('Invalid or expired invitation token');
      }
   }
}
