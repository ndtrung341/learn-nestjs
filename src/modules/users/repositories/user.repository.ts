import { BaseRepository } from '@common/repositories/base.repository';
import { User } from '../entities/user.entity';
import { Injectable } from '@nestjs/common';
import { Role } from '@constants/roles';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
   protected entityName = 'User';
   protected collections = [
      {
         id: '1',
         email: 'trung@example.com',
         fullName: 'Duy Trung',
         password:
            '$2b$10$CoPYheD54q9.ohPUwmU3wuEDyhWZstUAK0CHSGaziiSvOEVapfcW6',
         verified: true,
         role: Role.ADMIN,
         createdAt: new Date(),
         updatedAt: new Date(),
      },
      {
         id: '2',
         email: 'musk@example.com',
         fullName: 'Elon Musk',
         password:
            '$2b$10$CoPYheD54q9.ohPUwmU3wuEDyhWZstUAK0CHSGaziiSvOEVapfcW6',
         verified: true,
         role: Role.USER,
         createdAt: new Date(),
         updatedAt: new Date(),
      },
   ];

   async findByEmail(email: string) {
      const user = this.collections.find((user) => user.email === email);
      return user;
   }
}
