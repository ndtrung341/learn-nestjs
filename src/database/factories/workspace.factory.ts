import { BaseFactory } from '@db/core/base.factory';
import {
   WorkspaceEntity,
   WorkspaceVisibility,
} from '@modules/workspaces/entities/workspace.entity';
import { faker } from '@faker-js/faker';

export class WorkspaceFactory extends BaseFactory<WorkspaceEntity> {
   definition() {
      const name = faker.company.name();
      return {
         name,
         description: faker.company.catchPhrase(),
         slug: faker.helpers.slugify(name.toLowerCase()),
         visibility: faker.helpers.enumValue(WorkspaceVisibility),
      };
   }
}
