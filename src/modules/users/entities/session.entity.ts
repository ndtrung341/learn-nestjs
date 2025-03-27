import {
   BeforeInsert,
   BeforeUpdate,
   Column,
   Entity,
   JoinColumn,
   ManyToOne,
   PrimaryGeneratedColumn,
   Relation,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { BaseEntity } from '@db/core/base.entity';
import crypto from 'crypto';

@Entity('sessions')
export class SessionEntity extends BaseEntity {
   @PrimaryGeneratedColumn('uuid')
   id: string;

   @Column({ type: 'varchar', length: 255 })
   token: string;

   @Column({ default: false })
   invalid: boolean;

   @Column({ name: 'expires_in' })
   expiresIn: number;

   @Column({ type: 'uuid', name: 'user_id' })
   userId!: string;

   @ManyToOne(() => UserEntity, {
      onDelete: 'CASCADE',
   })
   @JoinColumn({ name: 'user_id' })
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
