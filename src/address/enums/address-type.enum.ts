/**
 * @description Tipos de dirección (Address Categories).
 * Valores normalizados para persistencia y contratos API.
 * @author Rentix 2026
 * @version 2026.2.1
 */
export enum AddressType {
  /** * @description Dirección legal/fiscal vinculada al NIF/CIF.
   */
  FISCAL = 'FISCAL',

  /** * @description Dirección operativa para relaciones comerciales.
   */
  COMMERCIAL = 'COMMERCIAL',

  /** * @description Dirección física del activo (Inmueble).
   */
  PROPERTY = 'PROPERTY',

  /** * @description Dirección designada para notificaciones administrativas.
   */
  NOTIFICATION = 'NOTIFICATION',

  /** * @description Cualquier otra ubicación no categorizada.
   */
  OTHER = 'OTHER',
}