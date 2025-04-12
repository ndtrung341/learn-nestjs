import {
   applyDecorators,
   HttpCode,
   HttpStatus,
   UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/auth/guards/auth.guard';
import { ResponseMessage } from './response-message.decorator';

export interface RouteOptions {
   message?: string;
   statusCode?: HttpStatus;
}

export function PublicRoute(options?: RouteOptions | string) {
   const opts: RouteOptions = normalizeOptions(options);

   const decorators = [HttpCode(opts.statusCode ?? HttpStatus.OK)];

   if (opts.message) {
      decorators.push(ResponseMessage(opts.message));
   }

   return applyDecorators(...decorators);
}

export function ProtectedRoute(options?: RouteOptions | string) {
   const opts: RouteOptions = normalizeOptions(options);

   const decorators = [
      UseGuards(AuthGuard),
      HttpCode(opts.statusCode ?? HttpStatus.OK),
   ];

   if (opts.message) {
      decorators.push(ResponseMessage(opts.message));
   }

   return applyDecorators(...decorators);
}

function normalizeOptions(options?: RouteOptions | string): RouteOptions {
   if (typeof options === 'string') {
      return { message: options };
   }

   return options ?? {};
}
