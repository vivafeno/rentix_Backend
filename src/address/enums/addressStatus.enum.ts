/**
 * @description Estados del ciclo de vida de una dirección en Rentix 2026.
 * Soporta el patrón 'Hydrated Drafts' para persistencia temporal en Wizards.
 * @author Rentix 2026
 * @version 2026.2.0
 */
export enum AddressStatus {
  /**
   * @description Borrador: Persistida durante Wizards, no vinculada legalmente aún.
   */
  DRAFT = 'DRAFT',

  /**
   * @description Activa: Dirección operativa y validada.
   */
  ACTIVE = 'ACTIVE',

  /**
   * @description Archivada: Registro histórico para trazabilidad de facturas antiguas.
   */
  ARCHIVED = 'ARCHIVED',
}