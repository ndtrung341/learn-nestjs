import { ProtectedRoute } from '@decorators/http.decorators';
import {
   Controller,
   Param,
   Post,
   UploadedFile,
   UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './services/users.service';
import { FormDataInterceptor } from '@interceptors/form-data.interceptor';
import { StorageService } from '@modules/storage/storage.service';
import { UserNotFoundException } from '@exceptions/user.exception';

@Controller('users')
export class UsersController {
   constructor(
      private usersService: UsersService,
      private storageService: StorageService,
   ) {}

   @Post(':id/avatar')
   @ProtectedRoute()
   @UseInterceptors(
      FormDataInterceptor('photo', {
         maxFileSize: 1024 * 1024,
         allowedFileType: 'image/(jpeg|png)',
      }),
   )
   async uploadUserAvatar(
      @Param('id') userId: string,
      @UploadedFile() file: Express.Multer.File,
   ) {
      const user = await this.usersService.findOneById(userId);
      if (!user) {
         throw new UserNotFoundException();
      }

      const photo = await this.storageService.save(file, 'profile_photos');
      if (user.image) {
         await this.storageService.delete(user.image);
      }

      await this.usersService.updateAvatar(userId, photo);

      return photo;
   }
}
