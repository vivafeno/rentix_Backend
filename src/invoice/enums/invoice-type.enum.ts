/**
 * @enum InvoiceType
 * @description Clasificación oficial de facturas según el Reglamento de Facturación AEAT y el estándar Veri*factu 2026.
 * Cada valor corresponde al código de tipo de factura exigido en los esquemas XML de FacturaE.
 */
export enum InvoiceType {
  /**
   * @description Factura Ordinaria (F1): Emitida para operaciones generales con desglose completo de datos del receptor.
   */
  ORDINARY = 'F1',

  /**
   * @description Factura Simplificada (F2): Anteriormente denominada 'Ticket'. Se emite en casos autorizados (ej. importes reducidos).
   */
  SIMPLIFIED = 'F2',

  /**
   * @description Factura Rectificativa (R1): Utilizada para corregir errores en facturas anteriores o gestionar devoluciones.
   */
  RECTIFICATIVE = 'R1',
}