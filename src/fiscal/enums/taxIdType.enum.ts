/**
 * @description Códigos de tipo de identificación fiscal (Veri*factu / FacturaE).
 * Estos códigos son obligatorios para el nodo <TaxIdentificationNumber> y determinan
 * el algoritmo de validación que aplicará la AEAT al recibir el XML.
 * @author Rentix 2026
 * @version 2026.2.0
 */
export enum TaxIdType {
  /**
   * @description 01: NIF/CIF (España).
   * Identificador estándar para personas físicas (DNI/NIE) y jurídicas españolas.
   */
  NIF = '01',

  /**
   * @description 02: NIF-IVA (Intra-community VAT).
   * Requerido para operadores inscritos en el censo VIES.
   */
  VAT_NUMBER = '02',

  /**
   * @description 03: Pasaporte.
   * Utilizado para clientes extranjeros sin NIF español ni residencia en la UE.
   */
  PASSPORT = '03',

  /**
   * @description 04: Documento oficial de identidad del país de residencia.
   * Usado cuando el cliente no tiene pasaporte pero sí DNI de su país de origen.
   */
  OFFICIAL_COUNTRY_ID = '04',

  /**
   * @description 05: Certificado de residencia.
   * Documento que acredita la residencia fiscal a efectos de convenios de doble imposición.
   */
  RESIDENCE_CERTIFICATE = '05',

  /**
   * @description 06: Otro documento probatorio.
   * Categoría residual para identificaciones no contempladas en las anteriores.
   */
  OTHER_PROBATORY_ID = '06',

  /**
   * @description 07: No Censado.
   * Aplicable a entidades en proceso de constitución o sin presencia en el censo de la AEAT.
   */
  NOT_IN_CENSUS = '07',
}
