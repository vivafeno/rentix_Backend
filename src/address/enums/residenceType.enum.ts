/**
 * @description Clasificación de residencia fiscal (Veri*factu / FacturaE).
 * Determina el régimen de IVA y las obligaciones de reporte (VIES/Export).
 * @author Rentix 2026
 * @version 2026.2.0
 */
export enum ResidenceType {
  /**
   * @description Residente en España (Península, Baleares, Canarias, Ceuta y Melilla).
   */
  SPAIN = 'ESPAÑA',

  /**
   * @description Residente en la Unión Europea (Requiere validación VIES).
   */
  EU_MEMBER = 'UNION_EUROPEA',

  /**
   * @description Terceros países (Extracomunitario / Exportaciones).
   */
  OUTSIDE_EU = 'EXTRANJERO',
}
