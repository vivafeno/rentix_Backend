/**
 * @enum ContractType
 * @description Tipología legal del contrato. 
 * Define la normativa aplicable (LAU) y el comportamiento fiscal automático.
 */
export enum ContractType {
  LONG_TERM_RENTAL = 'LONG_TERM_RENTAL',   // Vivienda habitual (Generalmente exento de IVA)
  COMMERCIAL_RENTAL = 'COMMERCIAL_RENTAL', // Locales, oficinas, naves (Con IVA y Retención)
  SEASONAL_RENTAL = 'SEASONAL_RENTAL',     // Temporada / Estudiantes (Sujeto a IVA en ciertos casos)
  ASSIGNMENT = 'ASSIGNMENT',               // Cesión de uso (Uso interno o gratuito)
  PARKING_SPACE = 'PARKING_SPACE',         // Plazas de garaje independientes (Lógica IVA propia)
  OTHER = 'OTHER',                         // Casos residuales
}