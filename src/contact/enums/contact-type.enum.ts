/**
 * Clasificación de los tipos de contacto para la agenda global.
 * @enum {string}
 */
export enum ContactType {
  ADMINISTRATION = 'ADMINISTRATION', // Personal administrativo / secretaría
  MANAGEMENT = 'MANAGEMENT',         // Dirección / Gerencia
  MAINTENANCE = 'MAINTENANCE',       // Personal técnico / Mantenimiento
  EMERGENCY = 'EMERGENCY',           // Contactos de urgencia 24h
  BILLING = 'BILLING',               // Responsable de facturación / Pagos
  LEGAL = 'LEGAL',                   // Representante legal / Abogado
  OTHER = 'OTHER',                   // Otros / Sin clasificar
}