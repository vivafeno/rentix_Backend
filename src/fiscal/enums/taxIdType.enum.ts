/**
 * @description Códigos oficiales de la AEAT para tipos de identificación fiscal.
 * Requerido para el nodo <TaxIdentificationNumber> en FacturaE y VeriFactu.
 * @version 2026.1.17
 */
export enum TaxIdType {
  /** * @description 01: NIF/CIF (España). 
   * Usado para DNI, NIE y CIF de entidades españolas. 
   */
  NIF = '01',

  /** * @description 02: NIF-IVA (Operador Intracomunitario). 
   * Clave para validaciones en el sistema VIES. 
   */
  NIF_IVA = '02',

  /** * @description 03: Pasaporte. 
   */
  PASSPORT = '03',

  /** * @description 04: Documento oficial de identificación expedido por el país de residencia. 
   */
  OFFICIAL_ID = '04',

  /** * @description 05: Certificado de residencia. 
   */
  RESIDENCE_DOC = '05',

  /** * @description 06: Otro documento probatorio. 
   */
  OTHER_ID = '06',

  /** * @description 07: No censado (Entidades en formación o casos especiales). 
   */
  NOT_IN_CENSUS = '07',
}