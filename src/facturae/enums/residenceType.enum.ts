/**
 * Residence type according to Facturae / AEAT
 *
 * R = Resident in Spain
 * U = Resident in EU (intracommunity)
 * E = Resident outside EU
 * O = Other
 */
export enum ResidenceType {
  RESIDENT = 'R',
  EU_RESIDENT = 'U',
  NON_EU_RESIDENT = 'E',
  OTHER = 'O',
}
