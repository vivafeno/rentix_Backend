/**
 * @enum BillingPeriod
 * @description Define el intervalo temporal que cubre cada factura emitida.
 * Crucial para el cálculo de conceptos de renta en el motor de Veri*factu.
 */
export enum PaymentFrequency {
  MONTHLY = 'MONTHLY',       // Facturación por meses naturales
  BIMONTHLY = 'BIMONTHLY',   // Cada 2 meses
  QUARTERLY = 'QUARTERLY',   // Cada 3 meses (Trimestral)
  SEMIANNUAL = 'SEMIANNUAL', // Cada 6 meses (Semestral)
  ANNUAL = 'ANNUAL',         // Una vez al año
}