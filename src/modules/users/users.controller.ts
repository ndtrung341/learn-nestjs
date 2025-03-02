import {
   BadRequestException,
   Body,
   ConflictException,
   Controller,
   Get,
   HttpException,
   HttpStatus,
   Param,
   Post,
   Put,
   UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { SimpleAuthGuard } from '@auth/guards/simple-auth.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@constants/roles';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { UserNotFoundException } from '@common/exceptions/user.exception';
import { LoginDto } from '@auth/dto';

@Controller('users')
export class UsersController {
   constructor(private readonly usersService: UsersService) {}

   @Get(':id')
   @UseGuards(SimpleAuthGuard)
   getUser(@Param('id') id: string) {
      return this.usersService.findById(id);
   }

   @Put(':id')
   @UseGuards(SimpleAuthGuard)
   updateUser(@Param('id') id: string, @Body() userDto: UserDto) {
      return this.usersService.update(id, userDto);
   }

   @Post('block')
   @UseGuards(JwtAuthGuard)
   @Roles([Role.ADMIN])
   blockUser() {
      return 'Block successfully';
   }
}
