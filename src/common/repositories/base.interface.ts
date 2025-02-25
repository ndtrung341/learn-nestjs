import { BaseEntity } from '@common/entities/base.entity';

export interface IBaseRepository<T extends BaseEntity> {
   findAll(): Promise<T[]>;
   findOne(id: T['id']): Promise<T | null | undefined>;
   create(data: Partial<T>): Promise<T | null>;
   update(id: T['id'], data: Partial<T>): Promise<T | null>;
   delete(id: T['id']): Promise<boolean>;
}
