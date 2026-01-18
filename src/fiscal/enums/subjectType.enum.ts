/**
 * @description Clasificación de sujeción al impuesto.
 * Define si la entidad está "Obligada a" (Sujeta) o "Exenta" de aplicar el impuesto.
 * @version 2026.1.17
 */
export enum SubjectType {
  /** * @description Sujeto (Obligado): La operación conlleva aplicación de IVA/IGIC.
   * Mapea al código 'S' en esquemas oficiales.
   */
  SUBJECT = 'S',

  /** * @description Exento: Operación sujeta pero exenta (ej. Alquiler de vivienda).
   * Mapea al código 'E' en esquemas oficiales.
   */
  EXEMPT = 'E',

  /** * @description No Sujeto: Fuera del ámbito del impuesto.
   * Mapea al código 'N' en esquemas oficiales.
   */
  NOT_SUBJECT = 'N',
}