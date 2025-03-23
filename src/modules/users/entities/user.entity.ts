import { BaseEntity } from '@db/entities/base.entity';
import { Exclude } from 'class-transformer';
import {
   BeforeInsert,
   BeforeUpdate,
   Column,
   Entity,
   Index,
   OneToMany,
} from 'typeorm';
import * as passwordUtils from '@utils/password';
import { SessionEntity } from './session.entity';

@Entity('user')
export class UserEntity extends BaseEntity {
   @Index()
   @Column({ unique: true })
   email: string;

   @Exclude()
   @Column()
   password: string;

   @Column({ name: 'first_name' })
   firstName: string;

   @Column({ name: 'last_name' })
   lastName: string;

   @Column({ default: '' })
   bio?: string;

   @Column({ default: '' })
   image?: string;

   @Column({ name: 'is_verified', default: false })
   isVerified: boolean;

   @Exclude()
   @Index()
   @Column({ name: 'verify_token', type: 'uuid', nullable: true })
   verifyToken: string | null;

   @Exclude()
   @Column({ name: 'verify_expires', type: 'timestamptz', nullable: true })
   verifyExpires: Date | null;

   @Exclude()
   @Index()
   @Column({ name: 'reset_token', type: 'uuid', nullable: true })
   resetToken: string | null;

   @Exclude()
   @Column({ name: 'reset_expires', type: 'timestamptz', nullable: true })
   resetExpires: Date | null;

   @OneToMany(() => SessionEntity, (session) => session.user)
   sessions?: SessionEntity[];

   @BeforeInsert()
   @BeforeUpdate()
   async hashPass() {
      if (this.password) {
         this.password = await passwordUtils.hashPassword(this.password);
      }
   }

   async checkPassword(password: string): Promise<boolean> {
      return await passwordUtils.comparePassword(password, this.password);
   }
}
