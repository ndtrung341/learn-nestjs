import { UserEntity } from '@modules/users/entities/user.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class User1744254201443 implements Seeder {
   track = false;

   public async run(
      dataSource: DataSource,
      factoryManager: SeederFactoryManager,
   ) {
      const userRepository = dataSource.getRepository(UserEntity);
      const userFactory = factoryManager.get(UserEntity);

      const password = 'Trung@341';

      userFactory.save({
         email: 'duytrung341@gmail.com',
         firstName: 'Trung',
         lastName: 'Nguyễn',
      });

      await userFactory.saveMany(5);
   }
}
