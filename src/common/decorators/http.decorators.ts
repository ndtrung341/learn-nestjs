import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { Roles, Public } from './auth.decorators';
import { Role } from '@constants/app.constants';
import { ResponseMessage } from './response-message.decorator';

interface ApiPublicOptions {
   message?: string;
   statusCode?: HttpStatus;
}

interface ApiPrivateOptions extends ApiPublicOptions {
   roles?: Role[];
}

export const ApiPublic = (options: ApiPublicOptions = {}) => {
   const { message, statusCode = HttpStatus.OK } = options;
   const decorators = [Public(), HttpCode(statusCode)];

   if (message) {
      decorators.push(ResponseMessage(message));
   }

   return applyDecorators(...decorators);
};

export const ApiPrivate = (options: ApiPrivateOptions = {}) => {
   const { message, roles = [], statusCode = HttpStatus.OK } = options;

   const decorators = [Roles(...roles), HttpCode(statusCode)];

   if (message) {
      decorators.push(ResponseMessage(message));
   }

   return applyDecorators(...decorators);
};
