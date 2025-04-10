import {
   WorkspaceEntity,
   WorkspaceVisibility,
} from '@modules/workspaces/entities/workspace.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(WorkspaceEntity, (faker) => {
   const workspace = new WorkspaceEntity();

   workspace.name = faker.company.name();
   workspace.description = faker.company.catchPhrase();
   workspace.visibility = faker.helpers.enumValue(WorkspaceVisibility);

   return workspace;
});
