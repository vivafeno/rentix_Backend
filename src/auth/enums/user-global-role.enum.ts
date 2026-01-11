/**
 * Roles globales del usuario dentro del sistema Rentix.
 *
 * Determinan el nivel de acceso general a la aplicación,
 * independientemente de los roles por empresa.
 */
export enum AppRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
}
