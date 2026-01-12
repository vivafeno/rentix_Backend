export enum PropertyStatus {
  /**
   * Listo para ser alquilado o publicado.
   */
  AVAILABLE = 'AVAILABLE',     // Antes: DISPONIBLE

  /**
   * Tiene un contrato activo y vigente.
   */
  RENTED = 'RENTED',           // Antes: ALQUILADO

  /**
   * IMPORTANTE: Se ha entregado una señal/fianza, pero aún no hay contrato activo.
   * Bloquea la propiedad para otros interesados.
   */
  RESERVED = 'RESERVED',

  /**
   * No disponible por obras, averías o preparación.
   */
  MAINTENANCE = 'MAINTENANCE', // Reemplaza a BLOQUEADO (más específico)

  /**
   * Retirado del mercado temporalmente (Baja administrativa).
   */
  UNAVAILABLE = 'UNAVAILABLE', // Antes: INACTIVO
}