/**
 * @description Roles de contexto patrimonial (Aislamiento de Empresa).
 * Define la jerarquía de acceso y autoridad dentro de un patrimonio específico.
 * @author Rentix 2026
 * @version 2026.2.0
 */
export enum CompanyRole {
  /**
   * @description Dueño del patrimonio. Control total sobre activos y facturación.
   */
  OWNER = 'PROPIETARIO',

  /**
   * @description Arrendatario. Acceso restringido a sus propios contratos y facturas recibidas.
   */
  TENANT = 'ARRENDATARIO',

  /**
   * @description Gestor o Asesor. Permisos de lectura/escritura delegados por el OWNER.
   */
  VIEWER = 'GESTOR',
}