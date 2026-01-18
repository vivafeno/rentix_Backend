/**
 * @description Estados operativos y de solvencia del arrendatario.
 * Determina la capacidad del sujeto para suscribir contratos y recibir facturas.
 * @author Rentix 2026
 * @version 2026.2.0
 */
export enum TenantStatus {
  /** * @description Con contrato vigente o capacidad plena para contratar. 
   */
  ACTIVE = 'ACTIVO',

  /** * @description Sin relación contractual activa pero con historial en la plataforma. 
   */
  INACTIVE = 'INACTIVO',

  /** * @description En fase de prospección o scoring (Lead/Candidato). 
   */
  POTENTIAL = 'POTENCIAL',

  /** * @description Sujeto con incidencias graves de impago o legales. 
   * El Service impedirá cualquier nueva operación con este sujeto.
   */
  BLACKLISTED = 'LISTA_NEGRA'
}