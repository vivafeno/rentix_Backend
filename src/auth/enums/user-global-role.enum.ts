/**
 * @enum AppRole
 * @description Jerarquía de permisos globales en la plataforma Rentix.
 * Estos roles definen capacidades a nivel de sistema (infraestructura, facturación global, soporte).
 */
export enum AppRole {
  /** 👑 Acceso total al sistema, gestión de infraestructura y configuración global. */
  SUPERADMIN = 'superadmin',

  /** 🛡️ Gestión operativa de la plataforma, soporte técnico y validación de entidades. */
  ADMIN = 'admin',

  /** 👤 Usuario estándar: Propietarios de activos, gestores o inquilinos. */
  USER = 'user',
}