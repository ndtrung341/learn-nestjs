import { ProtectedRoute } from '@decorators/http.decorators';
import {
   Body,
   Controller,
   Param,
   Post,
   UploadedFile,
   UploadedFiles,
   UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './services/users.service';
import {
   FileInfo,
   FormDataInterceptor,
} from '@interceptors/form-data.interceptor';
import { UploadService } from '@modules/upload/upload.service';

const MAX_FILE_SIZE = 1024 * 1024;
const FILE_TYPE = /(png|jpg|jpeg)/;

@Controller('users')
export class UsersController {
   constructor(
      private readonly usersService: UsersService,
      private uploadService: UploadService,
   ) {}

   @Post(':id/avatar')
   @ProtectedRoute()
   @UseInterceptors(
      FormDataInterceptor('photo', {
         fileSize: 1024 * 1024,
         fileType: 'image/*',
      }),
   )
   async uploadUserAvatar(
      @Param('id') userId: string,
      @UploadedFile() file: FileInfo,
   ) {
      const photo = await this.uploadService.save(file.buffer, file.filename);
      await this.usersService.updateAvatar(userId, photo);
      return photo;
   }
}
