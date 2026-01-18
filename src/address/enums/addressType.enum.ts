/**
 * @description Tipos de dirección con valores en terminología legal española.
 * Claves en inglés para coherencia del Blueprint 2026.
 * @author Rentix 2026
 * @version 2026.2.0
 */
export enum AddressType {
  /** * @description Dirección oficial ante la AEAT.
   */
  FISCAL = 'FISCAL',

  /** * @description Para efectos de comunicaciones comerciales no tributarias.
   */
  COMMERCIAL = 'COMERCIAL',

  /** * @description Ubicación física del activo inmobiliario.
   */
  PROPERTY = 'INMUEBLE',

  /** * @description Dirección de envío de facturas físicas o notificaciones legales.
   */
  NOTIFICATION = 'NOTIFICACION',

  /** * @description Otros lugares de explotación o almacenes.
   */
  OTHER = 'OTRA',
}
