import { UserEntity } from '@modules/users/entities/user.entity';
import {
   Column,
   Entity,
   JoinColumn,
   ManyToOne,
   PrimaryGeneratedColumn,
   Relation,
   Unique,
} from 'typeorm';
import { WorkspaceEntity } from './workspace.entity';
import { BaseEntity } from '@db/core/base.entity';

export enum WorkspaceMemberRole {
   ADMIN = 'admin',
   NORMAL = 'normal',
}

@Entity()
@Unique('UQ_workspace_member', ['userId', 'workspaceId'])
export class WorkspaceMemberEntity extends BaseEntity {
   @PrimaryGeneratedColumn('uuid')
   id: string;

   @Column()
   userId: string;

   @Column()
   workspaceId: string;

   @Column({
      type: 'enum',
      enum: WorkspaceMemberRole,
      default: WorkspaceMemberRole.NORMAL,
   })
   role: WorkspaceMemberRole;

   @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
   @JoinColumn()
   user: UserEntity;

   @ManyToOne(() => WorkspaceEntity, (workspace) => workspace.members, {
      onDelete: 'CASCADE',
   })
   @JoinColumn()
   workspace: Relation<WorkspaceEntity>;

   constructor(data?: Partial<WorkspaceMemberEntity>) {
      super(data);
   }
}
