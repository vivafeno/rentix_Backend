/**
 * @description Clasificación de la personalidad jurídica según el estándar FacturaE.
 * Determina la estructura del XML oficial (<Individual> vs <LegalEntity>).
 * @version 2026.1.17
 */
export enum PersonType {
  /**
   * @description Persona Física / Autónomo.
   * Mapea al nodo <Individual> en FacturaE.
   */
  INDIVIDUAL = 'F',

  /**
   * @description Persona Jurídica / Sociedad.
   * Mapea al nodo <LegalEntity> en FacturaE.
   */
  LEGAL_ENTITY = 'J',
}