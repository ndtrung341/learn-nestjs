import { BaseEntity } from '@common/entities/base.entity';
import { IBaseRepository } from './base.interface';
import { customAlphabet } from 'nanoid';

export class OperationFailedError extends Error {
  constructor(message: string = 'Operation failed') {
    super(message);
  }
}

export abstract class BaseRepository<T extends BaseEntity>
  implements IBaseRepository<T>
{
  private readonly generateId = customAlphabet('ABCDEF1234567890', 12);
  protected collections: T[] = [];
  protected abstract entityName: string;

  async findAll(): Promise<T[]> {
    return [...this.collections];
  }

  async findOne(id: T['id']): Promise<T | null> {
    const item = this.collections.find((item) => item.id === id);
    return item || null;
  }

  async create(data: Partial<T>): Promise<T> {
    const newItem = {
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    } as T;
    this.collections.push(newItem);
    return newItem;
  }

  async update(id: T['id'], data: Partial<T>): Promise<T> {
    const index = this.collections.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new OperationFailedError(
        `Update failed: Entity with id ${id} not found.`,
      );
    }

    const updatedItem = {
      ...this.collections[index],
      ...data,
      updatedAt: new Date(),
    } as T;

    this.collections[index] = updatedItem;
    return updatedItem;
  }

  async delete(id: T['id']): Promise<boolean> {
    const index = this.collections.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new OperationFailedError(
        `Delete failed: Entity with id ${id} not found.`,
      );
    }

    this.collections.splice(index, 1);
    return true;
  }
}
