import { Injectable } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { RegisterDto } from '@modules/auth/dto';
import { UserNotFoundException } from '@common/exceptions/user.exception';

@Injectable()
export class UsersService {
  private users = [
    {
      id: 1,
      email: 'trung@example.com',
      fullName: 'Duy Trung',
      password: '$2b$10$CoPYheD54q9.ohPUwmU3wuEDyhWZstUAK0CHSGaziiSvOEVapfcW6',
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      email: 'musk@example.com',
      fullName: 'Elon Musk',
      password: '$2b$10$CoPYheD54q9.ohPUwmU3wuEDyhWZstUAK0CHSGaziiSvOEVapfcW6',
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  findById(id: number) {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new UserNotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  findByEmail(email: string) {
    const user = this.users.find((u) => u.email === email);
    return user;
  }

  create(data: RegisterDto) {
    const user = {
      ...data,
      id: this.users.length + 1,
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  update(id: number, data: Partial<UserDto>) {
    const user = this.findById(id);
    Object.assign(user, { ...data, updatedAt: new Date() });
    return user;
  }
}
