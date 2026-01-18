/**
 * @description Categorización técnica de tributos.
 * Define el comportamiento del motor de facturación y el mapeo con Veri*factu.
 * @author Rentix 2026
 * @version 2026.2.0
 */
export enum TaxType {
  /**
   * @description Impuesto sobre el Valor Añadido (Península y Baleares).
   */
  IVA = 'IVA',

  /**
   * @description Impuesto sobre la Renta de las Personas Físicas (Retenciones).
   */
  IRPF = 'IRPF',

  /**
   * @description Impuesto General Indirecto Canario.
   */
  IGIC = 'IGIC',

  /**
   * @description Impuesto sobre la Producción, los Servicios y la Importación (Ceuta y Melilla).
   */
  IPSI = 'IPSI',

  /**
   * @description Otros tributos o tasas no categorizados.
   */
  OTRO = 'OTRO',
}
