import { BaseEntity } from '@db/entities/base.entity';
import {
   BeforeInsert,
   BeforeUpdate,
   Column,
   Entity,
   JoinColumn,
   ManyToOne,
} from 'typeorm';
import { UserEntity } from './user.entity';
import crypto from 'crypto';

@Entity({ name: 'session' })
export class SessionEntity extends BaseEntity {
   @Column({ type: 'varchar', length: 255 })
   jti: string;

   @Column({ default: false })
   invalid: boolean;

   @Column({ name: 'expires_in' })
   expiresIn: number;

   @Column({ type: 'uuid', name: 'user_id' })
   userId: string;

   @ManyToOne(() => UserEntity)
   @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'FK_SESSION_USER' })
   user: UserEntity;

   @BeforeInsert()
   @BeforeUpdate()
   hashJti() {
      if (this.jti) {
         this.jti = crypto.createHash('sha256').update(this.jti).digest('hex');
      }
   }
}
