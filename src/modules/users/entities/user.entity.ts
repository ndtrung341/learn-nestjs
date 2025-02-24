import { BaseEntity } from '@common/entities/base.entity';
import { Exclude, Expose } from 'class-transformer';

export class User extends BaseEntity {
  @Expose()
  email: string;

  @Expose()
  fullName: string;

  @Expose()
  bio?: string;

  @Expose()
  avatar?: string;

  @Expose()
  personal?: {
    phone?: string;
    dateOfBirth?: string;
  };

  @Expose()
  professional?: {
    position?: string;
    company?: string;
  };

  @Exclude()
  password: string;

  @Exclude()
  verified: boolean;
}
