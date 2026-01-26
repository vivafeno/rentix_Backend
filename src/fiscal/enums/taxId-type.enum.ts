/**
 * @description Códigos oficiales de la AEAT para el tipo de identificación (IDType).
 * Estos códigos mapean directamente con el bloque <IDOtro> de Veri*factu y SII.
 * Nota: El código '01' es de uso interno para NIF/CIF español (que se envía en el campo <NIF>).
 * @version 2026.1.22
 */
export enum TaxIdType {
  /**
   * @description 01: NIF/CIF (España).
   * Se utiliza para personas físicas o jurídicas con NIF español identificado en el censo.
   */
  NIF = '01',

  /**
   * @description 02: NIF-IVA (NIF Intracomunitario).
   * Obligatorio para operadores de la UE inscritos en el registro VIES.
   * Regla AEAT: El campo CódigoPaís es opcional ya que va implícito en las dos primeras letras.
   */
  INTRACOMMUNITY_VAT = '02',

  /**
   * @description 03: Pasaporte.
   * Documento de viaje internacional para clientes de fuera de la UE.
   * Regla AEAT: CódigoPaís obligatorio.
   */
  PASSPORT = '03',

  /**
   * @description 04: Documento oficial de identidad expedido por el país de residencia.
   * Utilizado para clientes extranjeros (UE o terceros) sin NIF-IVA.
   * Regla AEAT: CódigoPaís obligatorio.
   */
  FOREIGN_OFFICIAL_ID = '04',

  /**
   * @description 05: Certificado de residencia fiscal.
   * Acredita la residencia a efectos de convenios de doble imposición.
   * Regla AEAT: CódigoPaís obligatorio.
   */
  RESIDENCE_CERTIFICATE = '05',

  /**
   * @description 06: Otro documento probatorio.
   * Categoría residual para cualquier otro medio de identificación aceptado legalmente.
   * Regla AEAT: CódigoPaís obligatorio.
   */
  OTHER_PROBATORY_ID = '06',

  /**
   * @description 07: NIF no censado (España).
   * Aplicable cuando el NIF español no figura en la base de datos de la AEAT.
   * Regla AEAT: El CódigoPaís DEBE ser 'ES'.
   */
  NOT_IN_CENSUS = '07',
}