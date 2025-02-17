import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private usersMock = [
    {
      id: 1,
      displayName: 'John Doe',
      email: 'john@mail.com',
      password: 'abc123',
    },
    {
      id: 2,
      displayName: 'Jane Smith',
      email: 'jane@example.com',
      password: '456xyz',
    },
  ];

  create(createUserDto: CreateUserDto) {
    const user = {
      id: this.usersMock.length + 1,
      ...createUserDto,
    };
    this.usersMock.push(user);
    return user;
  }

  findAll() {
    return this.usersMock;
  }

  findOne(id: number) {
    const user = this.usersMock.find((u) => u.id == id);
    if (!user) throw new NotFoundException();
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const user = this.usersMock.find((u) => u.id == id);
    if (!user) throw new NotFoundException();
    Object.assign(user, updateUserDto);
    return user;
  }

  remove(id: number) {
    const userIndex = this.usersMock.findIndex((u) => u.id == id);
    if (userIndex == -1) throw new NotFoundException();
    this.usersMock.splice(userIndex, 1);
  }
}
