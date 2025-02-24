import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id')
  updateUser(@Param('id') id: string, @Body() userDto: UserDto) {
    return this.usersService.update(id, userDto);
  }
}
