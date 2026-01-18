import { AppRole } from '../enums/user-global-role.enum';
import { CompanyRole } from 'src/user-company-role/enums/companyRole.enum';

/**
 * @interface ActiveUserData
 * @description Estructura tipada del usuario en la request tras pasar el JWT Guard.
 */
export interface ActiveUserData {
  sub: string;
  email: string;
  appRole: AppRole;
  companyId: string;
  companyRole: CompanyRole;
}
