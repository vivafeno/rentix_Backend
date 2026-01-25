/**
 * @description Roles de contexto patrimonial (Multi-tenant Isolation).
 * Define la jerarquía de acceso y autoridad dentro de un patrimonio específico.
 * * ETIQUETADO DE NORMALIZACIÓN:
 * - Base de Datos: Valores en Inglés (Evita caracteres especiales como 'ó' o 'ñ').
 * - UI: El mapeo a español se realiza en el Frontend o mediante Pipes de traducción.
 * * @author Rentix 2026
 * @version 2026.2.1
 */
export enum CompanyRole {
  /**
   * @description Dueño del patrimonio. 
   * Control total (CRUD) sobre activos, facturación y configuración de empresa.
   */
  OWNER = 'OWNER',

  /**
   * @description Gestor administrativo o Asesor.
   * Permisos de gestión delegados. Puede operar pero no borrar la empresa.
   */
  MANAGER = 'MANAGER',

  /**
   * @description Arrendatario (Inquilino).
   * Acceso restringido exclusivamente a su panel de contratos, recibos y soporte.
   */
  TENANT = 'TENANT',

  /**
   * @description Auditor o Invitado.
   * Permiso de solo lectura para revisión de cuentas o estados.
   */
  VIEWER = 'VIEWER',
}