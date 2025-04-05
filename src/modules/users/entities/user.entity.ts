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

@Entity()
export class UserEntity extends BaseEntity {
   @PrimaryGeneratedColumn('uuid')
   id: string;

   @Column({ unique: true })
   email: string;

   @Exclude()
   @Column()
   password: string;

   @Column()
   firstName: string;

   @Column()
   lastName: string;

   @Column({ nullable: true, default: '' })
   bio?: string;

   @Column({ nullable: true, default: '' })
   image?: string;

   @Column({ default: false })
   emailVerified: boolean;

   @Exclude()
   @Index({ unique: true })
   @Column({ type: 'uuid', nullable: true })
   verifyToken: string | null;

   @Exclude()
   @Column({ type: 'timestamptz', nullable: true })
   verifyExpires: Date | null;

   @Exclude()
   @Index({ unique: true })
   @Column({ type: 'uuid', nullable: true })
   resetToken: string | null;

   @Exclude()
   @Column({ type: 'timestamptz', nullable: true })
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
      super(data);
   }
}
