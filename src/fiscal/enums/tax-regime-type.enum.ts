/**
 * @description Claves de Régimen Especial o Trascendencia (Veri*factu / SII).
 * Este código es obligatorio en el bloque de 'Desglose' de la factura para
 * informar a la AEAT sobre regímenes especiales de IVA o IGIC.
 * @author Rentix 2026
 * @version 2026.2.0
 */
export enum TaxRegimeType {
  /**
   * @description 01: Operación de régimen general.
   * Valor por defecto para la mayoría de arrendamientos de locales y oficinas.
   */
  GENERAL = '01',

  /**
   * @description 02: Exportación.
   * Operaciones fuera de la UE o asimiladas a exportación.
   */
  EXPORT = '02',

  /**
   * @description 03: Régimen especial de bienes usados (REBU).
   * Objetos de arte, antigüedades y objetos de colección.
   */
  USED_GOODS = '03',

  /**
   * @description 05: Régimen especial de agencias de viajes.
   */
  TRAVEL_AGENCIES = '05',

  /**
   * @description 07: Régimen especial del criterio de caja.
   * El devengo del IVA se produce en el cobro. Relevante para PYMES y Autónomos.
   */
  CASH_BASIS = '07',

  /**
   * @description 08: Régimen especial de agricultura, ganadería y pesca (REAGP).
   */
  AGRICULTURE = '08',

  /**
   * @description 09: Régimen especial del recargo de equivalencia.
   * Obligatorio al facturar a comerciantes minoristas (personas físicas).
   */
  EQUIVALENCE_SURCHARGE = '09',

  /**
   * @description 52: Régimen simplificado (Específico IGIC - Canarias).
   */
  SIMPLIFIED_IGIC = '52',
}
