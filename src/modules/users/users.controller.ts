import { ProtectedRoute } from '@decorators/http.decorators';
import {
   Controller,
   FileTypeValidator,
   MaxFileSizeValidator,
   Param,
   Post,
   UploadedFile,
   UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { slugify } from '@utils/string';
import { UsersService } from './services/users.service';
import { FileValidatorPipe } from '@pipes/file-validator.pipe';

const UPLOAD_DESTINATION = 'assets/profile_photos';
const MAX_FILE_SIZE = 1024 * 1024;
const FILE_TYPE = /(png|jpg|jpeg)/;

@Controller('users')
export class UsersController {
   constructor(private readonly usersService: UsersService) {}

   @Post(':id/avatar')
   @ProtectedRoute()
   @UseInterceptors(
      FileInterceptor('photo', {
         storage: diskStorage({
            destination: UPLOAD_DESTINATION,
            filename: (req, file, callback) => {
               const ext = path.extname(file.originalname);
               const basename = path.basename(file.originalname, ext);
               const filename = `${Date.now()}_${slugify(basename, '_')}${ext}`;
               callback(null, filename);
            },
         }),
      }),
   )
   async uploadUserAvatar(
      @UploadedFile(
         new FileValidatorPipe({ maxSize: MAX_FILE_SIZE, fileType: FILE_TYPE }),
      )
      file: Express.Multer.File,
      @Param('id') userId: string,
   ) {
      const path = file.path.replace(/\\/g, '/');
      await this.usersService.updateAvatar(userId, path);

      return { path };
   }
}
