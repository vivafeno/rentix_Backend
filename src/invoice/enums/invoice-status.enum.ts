/**
 * @enum InvoiceStatus
 * @description Define el estado de validez legal y operativa de una factura en el ecosistema Rentix.
 * El flujo de estados garantiza la integridad exigida por el reglamento de sistemas de facturación 2026.
 */
export enum InvoiceStatus {
  /**
   * @description Borrador (DRAFT): El documento es editable y no tiene validez legal. 
   * No posee número de serie definitivo ni huella digital (hash).
   */
  DRAFT = 'DRAFT',

  /**
   * @description Emitida (EMITTED): Factura oficial inmutable. 
   * Se le ha asignado número legal, hash encadenado y es apta para reporte a la AEAT.
   */
  EMITTED = 'EMITTED',

  /**
   * @description Anulada (CANCELLED): La factura ha sido invalidada. 
   * Requiere la existencia de una factura rectificativa vinculada para mantener la trazabilidad.
   */
  CANCELLED = 'CANCELLED',
}