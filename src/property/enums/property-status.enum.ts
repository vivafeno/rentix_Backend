export enum PropertyStatus {
  /** Listo para ser alquilado o publicado. */
  AVAILABLE = 'AVAILABLE',

  /** Tiene un contrato activo y vigente. */
  RENTED = 'RENTED',

  /** Se ha entregado una señal/fianza, pero aún no hay contrato activo. */
  RESERVED = 'RESERVED',

  /** No disponible por obras, averías o preparación. */
  MAINTENANCE = 'MAINTENANCE',

  /** Retirado del mercado temporalmente (Baja administrativa). */
  UNAVAILABLE = 'UNAVAILABLE',
}