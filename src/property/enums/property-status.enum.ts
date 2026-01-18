/**
 * @description Estados operativos del activo inmobiliario.
 * Controla la disponibilidad para la creación de contratos y flujos de wizard.
 * @author Rentix 2026
 * @version 2026.2.0
 */
export enum PropertyStatus {
  /** * @description Listo para ser alquilado o publicado.
   */
  AVAILABLE = 'DISPONIBLE',

  /** * @description Tiene un contrato de arrendamiento activo y vigente.
   */
  RENTED = 'ALQUILADO',

  /** * @description Con señal/fianza recibida, bloqueado para nuevos contratos.
   */
  RESERVED = 'RESERVADO',

  /** * @description Fuera de servicio por reformas o adecuación técnica.
   */
  MAINTENANCE = 'MANTENIMIENTO',

  /** * @description Retirado del inventario activo (Baja lógica).
   */
  UNAVAILABLE = 'NO_DISPONIBLE',
}
