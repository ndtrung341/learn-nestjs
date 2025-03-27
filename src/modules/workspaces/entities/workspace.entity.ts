import { BaseEntity } from '@db/core/base.entity';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum WorkspaceVisibility {
   PUBLIC = 'public',
   PRIVATE = 'private',
}

@Entity('workspaces')
export class WorkspaceEntity extends BaseEntity {
   @PrimaryGeneratedColumn('uuid')
   id: string;

   @Column()
   name: string;

   @Column({ default: '' })
   description?: string;

   @Index()
   @Column({ unique: true })
   slug: string;

   @Column({
      type: 'enum',
      enum: WorkspaceVisibility,
      default: WorkspaceVisibility.PRIVATE,
   })
   visibility: WorkspaceVisibility;
}
