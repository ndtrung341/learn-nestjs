import { SetMetadata } from '@nestjs/common';
import { Role } from '@constants/app.constants';

export const ROLES_KEY = 'roles';
export const Roles = (...role: Role[]) => SetMetadata(ROLES_KEY, role);

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
