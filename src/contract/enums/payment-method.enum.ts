/**
 * @enum PaymentMethod
 * @description Métodos de pago normalizados según el estándar FacturaE de la AEAT.
 * Los códigos numéricos permiten la integración directa con Veri*factu.
 * @version 2026.2.2
 */
export enum PaymentMethod {
  CASH = '01',          // Efectivo
  TRANSFER = '02',      // Transferencia
  DIRECT_DEBIT = '03',  // Domiciliación (Adeudo SEPA - El estándar para Rentix)
  CARD = '04',          // Tarjeta
  CHEQUE = '08',        // Cheque
  COMPENSATION = '09',  // Compensación de deudas
  OTHER = '99',         // Otros métodos
}