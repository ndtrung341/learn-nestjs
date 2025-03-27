import { UserEntity } from '@modules/users/entities/user.entity';
import {
   Column,
   Entity,
   Index,
   JoinColumn,
   ManyToOne,
   PrimaryGeneratedColumn,
   Unique,
} from 'typeorm';
import { WorkspaceEntity } from './workspace.entity';
import { BaseEntity } from '@db/core/base.entity';

export enum WorkspaceMemberRole {
   ADMIN = 'admin',
   NORMAL = 'normal',
}

@Entity('workspace_members')
@Unique(['user', 'workspace'])
export class WorkspaceMemberEntity extends BaseEntity {
   @PrimaryGeneratedColumn('uuid')
   id: string;

   @Index()
   @Column({ name: 'user_id' })
   userId: string;

   @Index()
   @Column({ name: 'workspace_id' })
   workspaceId: string;

   @Column({
      type: 'enum',
      enum: WorkspaceMemberRole,
      default: WorkspaceMemberRole.NORMAL,
   })
   role: WorkspaceMemberRole;

   @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
   @JoinColumn({ name: 'user_id' })
   user: UserEntity;

   @ManyToOne(() => WorkspaceEntity, { onDelete: 'CASCADE' })
   @JoinColumn({ name: 'workspace_id' })
   workspace: WorkspaceEntity;
}
