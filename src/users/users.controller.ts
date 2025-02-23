import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { UserNotFound } from 'src/common/exceptions/domain.exception';
import { plainToInstance } from 'class-transformer';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  getUser(@Param('id') id: number) {
    try {
      const user = this.usersService.findById(id);
      return plainToInstance(UserDto, user, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof UserNotFound) {
        throw new NotFoundException('User not found');
      }
    }
  }

  @Put(':id')
  updateUser(@Param('id') id: number, @Body() userDto: UserDto) {
    try {
      const user = this.usersService.updateProfile(id, userDto);
      return plainToInstance(UserDto, user, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof UserNotFound) {
        throw new NotFoundException('User not found');
      }
    }
  }
}
