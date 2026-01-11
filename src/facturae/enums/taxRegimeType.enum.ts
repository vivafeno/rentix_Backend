/**
 * Claves de Régimen Especial o Trascendencia (Tabla oficial AEAT).
 * Obligatorio para Libros Registro y SII.
 */
export enum TaxRegimeType {
  /** 01: Operación de régimen general (El 99% de las empresas S.L. y Autónomos normales) */
  GENERAL = '01',

  /** 02: Exportación */
  EXPORT = '02',

  /** 03: Régimen especial de bienes usados, objetos de arte, antigüedades y objetos de colección */
  USED_GOODS = '03',

  /** 05: Régimen especial de agencias de viajes */
  TRAVEL_AGENCIES = '05',

  /** 07: Régimen especial del criterio de caja (El IVA se devenga al cobrar) */
  CASH_BASIS = '07',

  /** 08: Régimen especial de la agricultura, ganadería y pesca (REAGP) */
  AGRICULTURE = '08',

  /** 52: Régimen simplificado (Solo aplica a IGIC - Canarias, o casos muy específicos de IVA no deducible) */
  SIMPLIFIED_IGIC = '52',
  
  // NOTA: 'EXEMPT' no es un régimen. Estás en Régimen General (01) y emites una factura exenta.
}