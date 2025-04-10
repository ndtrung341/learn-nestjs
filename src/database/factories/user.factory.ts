import { UserEntity } from '@modules/users/entities/user.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(UserEntity, (faker) => {
   const user = new UserEntity();

   user.firstName = faker.person.firstName();
   user.lastName = faker.person.lastName();
   user.email = faker.internet.email().toLowerCase();
   user.bio = faker.lorem.sentence();
   user.image = faker.image.avatar();
   user.emailVerified = true;
   user.password = 'Trung@341';

   return user;
});
