import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseEntity {
   @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
   createdAt: Date;

   @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
   updatedAt: Date;

   constructor(data: Partial<BaseEntity>) {
      Object.assign(this, data);
   }
}
