import { SetMetadata } from '@nestjs/common';
import { AppRole } from 'src/auth/enums/user-global-role.enum';

export const ROLES_KEY = 'userGlobalRoles';
export const Roles = (...userGlobalRoles: AppRole[]) => SetMetadata(ROLES_KEY, userGlobalRoles);