import { BaseEntity } from '@db/core/base.entity';
import { Exclude } from 'class-transformer';
import {
   BeforeInsert,
   BeforeUpdate,
   Column,
   Entity,
   Index,
   PrimaryGeneratedColumn,
} from 'typeorm';
import * as hashUtil from '@utils/bcrypt';

@Entity('users')
export class UserEntity extends BaseEntity {
   @PrimaryGeneratedColumn('uuid')
   id: string;

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

   @Column({ name: 'email_verified', default: false })
   emailVerified: boolean;

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

   @BeforeInsert()
   @BeforeUpdate()
   async hashPass() {
      if (this.password) {
         this.password = await hashUtil.hash(this.password);
      }
   }

   async checkPassword(password: string): Promise<boolean> {
      return await hashUtil.verify(password, this.password);
   }

   constructor(data?: Partial<UserEntity>) {
      super();
      Object.assign(this, data);
   }
}
