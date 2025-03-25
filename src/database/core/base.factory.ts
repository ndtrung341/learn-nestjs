import { DeepPartial } from 'typeorm';

export abstract class BaseFactory<T> {
   abstract definition(): DeepPartial<T>;

   create(overrides?: DeepPartial<T>): T {
      const defaults = this.definition();
      return { ...defaults, ...overrides } as T;
   }

   createMany(amount: number, overrides?: DeepPartial<T>): T[] {
      return Array.from({ length: amount }, () => this.create(overrides));
   }
}
