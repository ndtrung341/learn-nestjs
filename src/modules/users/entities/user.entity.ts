import { BaseEntity } from '@db/entities/base.entity';
import { Exclude } from 'class-transformer';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import * as passwordUtils from '@utils/password';
import { SessionEntity } from './session.entity';

@Entity('user')
export class UserEntity extends BaseEntity {
   @Column({ unique: true })
   email: string;

   @Column()
   @Exclude()
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
   @Column({ name: 'verify_token', nullable: true })
   verifyToken: string;

   @Exclude()
   @Column({ name: 'verify_expires', type: 'timestamptz', nullable: true })
   verifyExpires?: Date;

   @OneToMany(() => SessionEntity, (session) => session.user)
   sessions: SessionEntity[];

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
