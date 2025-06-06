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
import { BaseEntity } from '@common/entities/base.entity';
import crypto from 'crypto';

@Entity()
export class SessionEntity extends BaseEntity {
   @PrimaryGeneratedColumn('uuid')
   id: string;

   @Column({ type: 'varchar', length: 255 })
   token: string;

   @Column({ default: false })
   invalid: boolean;

   @Column()
   expiresIn: number;

   @Column({ type: 'uuid' })
   userId!: string;

   @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
   @JoinColumn()
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
