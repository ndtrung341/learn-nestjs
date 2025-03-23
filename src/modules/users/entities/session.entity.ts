import {
   BeforeInsert,
   BeforeUpdate,
   Column,
   Entity,
   JoinColumn,
   ManyToOne,
   Relation,
} from 'typeorm';
import { UserEntity } from './user.entity';
import crypto from 'crypto';
import { BaseEntity } from '@db/entities/base.entity';

@Entity({ name: 'session' })
export class SessionEntity extends BaseEntity {
   @Column({ type: 'varchar', length: 255 })
   token: string;

   @Column({ default: false })
   invalid: boolean;

   @Column({ name: 'expires_in' })
   expiresIn: number;

   @Column({ type: 'uuid', name: 'user_id' })
   userId!: string;

   @ManyToOne(() => UserEntity, (user) => user.sessions)
   @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'FK_SESSION_USER' })
   user!: Relation<UserEntity>;

   @BeforeInsert()
   @BeforeUpdate()
   hashToken() {
      if (this.token) {
         this.token = crypto
            .createHash('sha256')
            .update(this.token)
            .digest('hex');
      }
   }
}
