/**
 * @description Códigos de residencia fiscal según la Orden HAP/1650/2015 (Facturae).
 * Determina el tratamiento fiscal de la operación (IVA, Inversión del Sujeto Pasivo, etc.).
 * @version 2026.1.17
 */
export enum ResidenceType {
  /**
   * @description R: Residente en España.
   * Incluye Península, Baleares, Canarias, Ceuta y Melilla.
   */
  RESIDENT = 'R',

  /**
   * @description U: Residente en otro país miembro de la Unión Europea.
   * Clave para operaciones intracomunitarias y validación VIES.
   */
  EU_RESIDENT = 'U',

  /**
   * @description E: Residente fuera de la Unión Europea.
   * Clave para exportaciones y operaciones extracomunitarias.
   */
  NON_EU_RESIDENT = 'E',

  /**
   * @description O: Otros casos especiales.
   * Nota: Usar solo si no encaja en las categorías anteriores según normativa AEAT.
   */
  OTHER = 'O',
}