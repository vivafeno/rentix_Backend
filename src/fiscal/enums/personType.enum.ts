/**
 * @description Clasificación de la personalidad jurídica (Veri*factu / FacturaE).
 * Define si el obligado tributario es una persona física o una entidad jurídica.
 * Este valor determina la estructura de los nodos <Individual> y <LegalEntity> en el XML.
 * * @author Rentix 2026
 * @version 2026.2.0
 * @see {@link https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/ssii/fact/ws/RespuestaSuministroFactEmitidas.xsd}
 */
export enum PersonType {
  /**
   * @description Persona Física / Autónomo.
   * Clave AEAT: 'F'.
   */
  INDIVIDUAL = 'F',

  /**
   * @description Persona Jurídica / Sociedad.
   * Clave AEAT: 'J'.
   */
  LEGAL_ENTITY = 'J',
}