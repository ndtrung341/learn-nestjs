import { BaseEntity } from '@common/entities/base.entity';
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
   @Column({ nullable: true })
   password: string;

   @Column({ nullable: true })
   firstName: string;

   @Column({ nullable: true })
   lastName: string;

   @Column({ nullable: true, default: '' })
   bio?: string;

   @Column({ nullable: true, default: '' })
   image?: string;

   @Column({ default: false })
   emailVerified: boolean;

   @BeforeInsert()
   @BeforeUpdate()
   async hashPass() {
      if (this.password) {
         this.password = await hashUtil.hash(this.password);
      }
   }

   get fullName() {
      return `${this.lastName} ${this.firstName}`;
   }

   async checkPassword(password: string): Promise<boolean> {
      return await hashUtil.verify(password, this.password);
   }

   constructor(data?: Partial<UserEntity>) {
      super(data);
   }
}
