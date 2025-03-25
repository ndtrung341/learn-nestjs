import { BaseFactory } from '@db/core/base.factory';
import { UserEntity } from '@modules/users/entities/user.entity';
import { faker } from '@faker-js/faker';

export class UserFactory extends BaseFactory<UserEntity> {
   definition() {
      return {
         firstName: faker.person.firstName(),
         lastName: faker.person.lastName(),
         email: faker.internet.email().toLowerCase(),
         bio: faker.person.bio(),
         image: faker.image.avatar(),
         emailVerified: true,
      };
   }
}
