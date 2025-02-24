import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  getUser(@Param('id') id: number) {
    const user = this.usersService.findById(id);
    return plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  updateUser(@Param('id') id: number, @Body() userDto: UserDto) {
    const user = this.usersService.update(id, userDto);
    return plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
