import { SetMetadata } from '@nestjs/common';
import { UserGlobalRole } from 'src/auth/enums/user-global-role.enum';

export const ROLES_KEY = 'userGlobalRoles';
export const Roles = (...userGlobalRoles: UserGlobalRole[]) => SetMetadata(ROLES_KEY, userGlobalRoles);