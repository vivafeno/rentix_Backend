/**
 * Estado de la dirección dentro del sistema
 *
 * - DRAFT: creada durante un wizard, aún no asociada a una empresa
 * - ACTIVE: dirección válida y operativa
 * - ARCHIVED: histórica / no utilizable
 */
export enum AddressStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}