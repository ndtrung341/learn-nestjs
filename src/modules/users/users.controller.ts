import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { AuthGuard } from '@modules/auth/auth.guard';

@Controller('users')
export class UsersController {
   constructor(private readonly usersService: UsersService) {}

   @Get(':id')
   @UseGuards(AuthGuard)
   getUser(@Param('id') id: string) {
      return this.usersService.findById(id);
   }

   @Put(':id')
   @UseGuards(AuthGuard)
   updateUser(@Param('id') id: string, @Body() userDto: UserDto) {
      return this.usersService.update(id, userDto);
   }
}
