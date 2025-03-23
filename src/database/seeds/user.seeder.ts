import { DataSource } from 'typeorm';
import { Seeder } from './type';
import { UserEntity } from '@modules/users/entities/user.entity';
import { faker } from '@faker-js/faker';

export class UserSeeder implements Seeder {
   static async run(dataSource: DataSource) {
      const userRepository = dataSource.getRepository(UserEntity);

      const users = Array.from({ length: 5 }).map(() =>
         userRepository.create({
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            bio: faker.person.bio(),
            image: faker.image.avatar(),
            isVerified: true,
         }),
      );

      await userRepository.save(users);
   }
}
