import { Injectable, NotFoundException } from '@nestjs/common';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { UserDto } from './dto/user.dto';

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
    const user = this.users.find((u) => u.id == id);
    if (!user) throw new NotFoundException();
    return user;
  }

  findByEmail(email: string) {
    return this.users.find((u) => u.email === email);
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
    if (user) {
      Object.assign(user, { ...data, updatedAt: new Date() });
    }
    return user;
  }
}
