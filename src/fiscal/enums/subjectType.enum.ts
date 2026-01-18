/**
 * @description Clasificación de sujeción al IVA/IGIC (Veri*factu / FacturaE).
 * Define el comportamiento del impuesto en la línea de factura y el desglose en el XML.
 * @author Rentix 2026
 * @version 2026.2.0
 */
export enum SubjectType {
  /**
   * @description Sujeto: Operación sujeta y no exenta.
   * Clave AEAT: 'S1'. Corresponde a operaciones con cuota de IVA ordinaria.
   */
  SUBJECT = 'S1',

  /**
   * @description Sujeto y Exento: Operación sujeta pero con exención (Art. 20 LIVA).
   * Clave AEAT: 'S2'. Ej: Alquiler de vivienda estable, servicios médicos.
   */
  EXEMPT = 'S2',

  /**
   * @description No Sujeto por reglas de localización (Art. 7, 14 LIVA).
   * Clave AEAT: 'N1'. Operaciones que se consideran realizadas fuera del territorio.
   */
  NOT_SUBJECT_LOCALIZATION = 'N1',

  /**
   * @description No Sujeto por otros motivos.
   * Clave AEAT: 'N2'. Otros supuestos de no sujeción.
   */
  NOT_SUBJECT_OTHER = 'N2',
}
