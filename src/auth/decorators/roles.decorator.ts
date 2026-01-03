import { SetMetadata } from '@nestjs/common';
import { UserGlobalRole } from 'src/user/entities/user.entity';

export const ROLES_KEY = 'userGlobalRoles';
export const Roles = (...userGlobalRoles: UserGlobalRole[]) => SetMetadata(ROLES_KEY, userGlobalRoles);