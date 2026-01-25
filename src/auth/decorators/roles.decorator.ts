import { SetMetadata } from '@nestjs/common';
// Rutas exactas según tu árbol:
import { AppRole } from '../enums/user-global-role.enum';
import { CompanyRole } from '../../user-company-role/enums/user-company-role.enum';

export const ROLES_KEY = 'roles';

// Definimos la unión de tipos para aceptar ambos sistemas de roles
export type AllowedRoles = AppRole | CompanyRole;

export const Roles = (...roles: AllowedRoles[]) =>
  SetMetadata(ROLES_KEY, roles);
