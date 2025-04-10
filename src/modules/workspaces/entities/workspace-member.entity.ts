import { UserEntity } from '@modules/users/entities/user.entity';
import {
   Column,
   Entity,
   JoinColumn,
   ManyToOne,
   PrimaryColumn,
   Relation,
   Unique,
} from 'typeorm';
import { WorkspaceEntity } from './workspace.entity';
import { BaseEntity } from '@common/entities/base.entity';

export enum WorkspaceMemberRole {
   ADMIN = 'admin',
   MEMBER = 'member',
   VIEWER = 'viewer',
}

@Entity()
@Unique('UQ_workspace_member', ['userId', 'workspaceId'])
export class WorkspaceMemberEntity extends BaseEntity {
   @PrimaryColumn('uuid')
   workspaceId: string;

   @PrimaryColumn('uuid')
   userId: string;

   @Column({
      type: 'enum',
      enum: WorkspaceMemberRole,
      default: WorkspaceMemberRole.MEMBER,
   })
   role: WorkspaceMemberRole;

   @Column({ nullable: true })
   invitedById: string;

   @Column({ type: 'timestamptz', nullable: true })
   invitedAt: Date;

   @Column({ type: 'timestamptz', nullable: true })
   joinedAt: Date;

   @ManyToOne(() => WorkspaceEntity, (workspace) => workspace.members, {
      onDelete: 'CASCADE',
   })
   @JoinColumn()
   workspace: Relation<WorkspaceEntity>;

   @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
   @JoinColumn()
   user: Relation<UserEntity>;

   @ManyToOne(() => UserEntity)
   @JoinColumn()
   invitedBy: Relation<UserEntity>;

   constructor(data?: Partial<WorkspaceMemberEntity>) {
      super(data);
   }
}
