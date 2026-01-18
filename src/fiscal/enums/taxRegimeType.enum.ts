/**
 * @description Claves de Régimen Especial o Trascendencia (Tabla oficial AEAT).
 * Obligatorio para el Suministro Inmediato de Información (SII) y VeriFactu.
 * @version 2026.1.17
 */
export enum TaxRegimeType {
  /**
   * @description 01: Operación de régimen general.
   * Aplicable a la gran mayoría de sociedades (S.L./S.A.) y autónomos.
   */
  GENERAL = '01',

  /**
   * @description 02: Exportación.
   */
  EXPORT = '02',

  /**
   * @description 03: Régimen especial de bienes usados y objetos de arte.
   */
  USED_GOODS = '03',

  /**
   * @description 05: Régimen especial de agencias de viajes.
   */
  TRAVEL_AGENCIES = '05',

  /**
   * @description 07: Régimen especial del criterio de caja.
   * El IVA se devenga en el momento del cobro total o parcial. Muy común en pymes.
   */
  CASH_BASIS = '07',

  /**
   * @description 08: Régimen especial de la agricultura, ganadería y pesca (REAGP).
   */
  AGRICULTURE = '08',

  /**
   * @description 09: Régimen especial del recargo de equivalencia.
   * Importante si se factura a arrendatarios que sean comerciantes minoristas (personas físicas).
   */
  EQUIVALENCE_SURCHARGE = '09',

  /**
   * @description 52: Régimen simplificado (Específico IGIC - Canarias).
   */
  SIMPLIFIED_IGIC = '52',
}