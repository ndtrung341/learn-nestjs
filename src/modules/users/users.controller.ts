import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { SimpleAuthGuard } from '@auth/guards/simple-auth.guard';
import { LocalAuthGuard } from '@auth/guards/local-auth.guard';

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

   @Get('test-passport-local')
   @UseGuards(LocalAuthGuard)
   testLocal(@Param('id') id: string) {
      return this.usersService.findById(id);
   }
}
