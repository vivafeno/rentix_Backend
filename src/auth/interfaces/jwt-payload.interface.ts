import { AppRole } from '../enums/user-global-role.enum';
import { CompanyRole } from 'src/user-company-role/enums/user-company-role.enum';

/**
 * @interface ActiveUserData
 * @description Estructura inmutable del contexto de usuario en ejecución.
 * Alineado con el estándar de seguridad Rentix para prevenir contaminación de tipos.
 */
export interface ActiveUserData {
  /** UUID del usuario (Sujeto) */
  readonly id: string;
  
  /** Identificador de comunicación */
  readonly email: string;
  
  /** Rol administrativo global */
  readonly appRole: AppRole;

  /** * Contexto de Tenant: Puede ser opcional si el usuario 
   * no ha seleccionado empresa al autenticarse. 
   */
  readonly companyId?: string;

  /** Rol específico dentro del Tenant */
  readonly companyRole?: CompanyRole;

  /** Timestamp de emisión (opcional para trazabilidad) */
  readonly iat?: number;
}