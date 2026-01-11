/**
 * Residence Type Code according to Facturae (Order HAP/1650/2015).
 * Defines the tax residence status for the invoicing party.
 */
export enum ResidenceType {
  /** R: Residente en España (Resident in Spain) */
  RESIDENT = 'R',

  /** U: Residente en la Unión Europea (Intracommunity) */
  EU_RESIDENT = 'U',

  /** E: Residente fuera de la UE (Extracommunity) */
  NON_EU_RESIDENT = 'E',

  /** O: Otros (Usar con precaución en Facturae) */
  OTHER = 'O',
}