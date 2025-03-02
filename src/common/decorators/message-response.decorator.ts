import { SetMetadata } from '@nestjs/common';

export const MESSAGE_RESPONSE_KEY = 'message_response';

export const MessageResponse = (message: string) =>
   SetMetadata(MESSAGE_RESPONSE_KEY, message);
