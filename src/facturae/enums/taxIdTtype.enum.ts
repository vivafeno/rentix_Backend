/**
 * Tipos de Documento Identificativo.
 *
 * NOTA: Facturae XML no pide este código explícitamente, pero esta clasificación
 * (Estándar AEAT/SII) es necesaria para deducir el <ResidenceTypeCode> correcto.
 */
export enum TaxIdType {
  /**
   * NIF / DNI / NIE (Documento Nacional de Identidad Español).
   * Valor AEAT: '01'
   * Implica ResidenceType = 'R' (normalmente).
   */
  NIF = '01',

  /**
   * NIF-IVA (Operador Intracomunitario - VIES).
   * Valor AEAT: '02'
   * Implica ResidenceType = 'U' (Unión Europea).
   */
  EU_VAT = '02',

  /**
   * Pasaporte.
   * Valor AEAT: '03'
   * Implica ResidenceType = 'E' (Extranjero).
   */
  PASSPORT = '03',

  /**
   * Documento oficial de identificación expedido por el país de residencia.
   * Valor AEAT: '04'
   * Implica ResidenceType = 'E' (Extranjero).
   */
  FOREIGN_ID = '04',

  /**
   * Otro documento probatorio.
   * Valor AEAT: '06'
   */
  OTHER = '06',
}