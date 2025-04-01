import { getDataSource } from '@db/data-source';
import { Repository, EntityManager } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';

export function Transaction(isolationLevel?: IsolationLevel) {
   return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor,
   ) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
         const dataSource = await getDataSource();
         if (!dataSource) {
            throw new Error('DataSource not initialized');
         }

         // Create transaction callback with entity manager
         const transactionCallback = async (entityManager: EntityManager) => {
            // Create new repository instances bound to the transaction
            const repositoryInstances = Object.keys(this)
               .filter((key) => this[key] instanceof Repository)
               .reduce((acc, key) => {
                  const repository = this[key];
                  const entityType = repository.target;
                  acc[key] = entityManager.getRepository(entityType);
                  return acc;
               }, {});

            // Create proxy to intercept repository calls
            const proxy = new Proxy(this, {
               get(target, property) {
                  // If property is a repository, return transaction-bound version
                  if (repositoryInstances[property]) {
                     return repositoryInstances[property];
                  }
                  return target[property];
               },
            });

            // Call original method with proxy context and entity manager
            return originalMethod.apply(proxy, [...args, entityManager]);
         };

         // Execute transaction with or without isolation level
         if (isolationLevel) {
            return dataSource.transaction(isolationLevel, transactionCallback);
         } else {
            return dataSource.transaction(transactionCallback);
         }
      };

      return descriptor;
   };
}
