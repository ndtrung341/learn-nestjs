import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { ApiPrivate } from '@decorators/http.decorators';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
   constructor(private readonly usersService: UsersService) {}

   @Post()
   @ApiPrivate({
      statusCode: HttpStatus.CREATED,
      message: 'User successfully created',
   })
   createUser(@Body() createUserDto: CreateUserDto) {
      return this.usersService.createUser(createUserDto);
   }
}
