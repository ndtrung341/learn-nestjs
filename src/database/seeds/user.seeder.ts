import { UserEntity } from '@modules/users/entities/user.entity';
import { BaseSeeder } from '@db/core/base.seeder';
import { UserFactory } from '@db/factories/user.factory';

export class UserSeeder extends BaseSeeder {
   async run() {
      const userRepo = this.dataSource.getRepository(UserEntity);
      const userFactory = new UserFactory();

      const password = 'Trung@341';

      const me = userRepo.create({
         email: 'duytrung341@gmail.com',
         password,
         emailVerified: true,
         firstName: 'Trung',
         lastName: 'Nguyễn',
      });

      const randomUsers = userFactory
         .createMany(5, { password })
         .map((data) => userRepo.create(data));

      await userRepo.insert([me, ...randomUsers]);
   }
}
