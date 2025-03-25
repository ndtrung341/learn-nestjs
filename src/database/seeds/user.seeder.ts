import { UserEntity } from '@modules/users/entities/user.entity';
import { BaseSeeder } from '@db/core/base.seeder';
import { UserFactory } from '@db/factories/user.factory';
import * as hashUtil from '@utils/bcrypt';

export class UserSeeder extends BaseSeeder {
   async run() {
      const userRepo = this.dataSource.getRepository(UserEntity);

      const passwordHash = await hashUtil.hash('Trung@341');

      const adminUser = userRepo.create({
         email: 'admin@example.com',
         password: passwordHash,
         emailVerified: true,
         firstName: 'Super',
         lastName: 'Admin',
      });
      await userRepo.save(adminUser, { listeners: false });

      const userFactory = new UserFactory();
      const randomUsers = userFactory.createMany(4, {
         password: passwordHash,
      });

      await userRepo.save(randomUsers);
   }
}
