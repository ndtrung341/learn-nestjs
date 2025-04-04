import { BaseEntity } from '@db/core/base.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { WorkspaceMemberEntity } from './workspace-member.entity';

export enum WorkspaceVisibility {
   PUBLIC = 'public',
   PRIVATE = 'private',
}

@Entity()
export class WorkspaceEntity extends BaseEntity {
   @PrimaryGeneratedColumn('uuid')
   id: string;

   @Column()
   name: string;

   @Column({ nullable: true, default: '' })
   description?: string;

   @Column({ unique: true })
   slug: string;

   @Column({
      type: 'enum',
      enum: WorkspaceVisibility,
      default: WorkspaceVisibility.PRIVATE,
   })
   visibility: WorkspaceVisibility;

   @OneToMany(() => WorkspaceMemberEntity, (members) => members.workspace)
   members: WorkspaceMemberEntity[];
}
