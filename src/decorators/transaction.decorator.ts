import { getDataSource } from '@utils/data-source';
import { Repository, EntityManager, DataSource } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';

type TransactionOptions = {
   name?: string;
   isolation?: IsolationLevel;
};

export function Transaction(options: TransactionOptions = {}) {
   return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor,
   ) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
         const dataSource = getDataSource(options?.name);

         const transactionCallback = async (manager: EntityManager) => {
            const proxy = new Proxy(this, {
               get(target, property) {
                  const value = target[property];

                  if (value instanceof Repository) {
                     return manager.getRepository(value.target);
                  } else if (value instanceof DataSource) {
                     return {
                        ...value,
                        manager,
                        query: manager.query.bind(manager),
                        createQueryBuilder:
                           manager.createQueryBuilder.bind(manager),
                     };
                  }

                  return value;
               },
            });

            return originalMethod.apply(proxy, args);
         };

         // Execute transaction with specified isolation level if provided
         return options?.isolation
            ? dataSource.transaction(options.isolation, transactionCallback)
            : dataSource.transaction(transactionCallback);
      };

      return descriptor;
   };
}
