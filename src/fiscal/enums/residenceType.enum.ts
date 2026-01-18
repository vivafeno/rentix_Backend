/**
 * @description Códigos de residencia fiscal (Veri*factu / FacturaE).
 * Basado en la Orden HAP/1650/2015. Determina el régimen de IVA aplicable:
 * 'R' -> Nacional, 'U' -> Intracomunitario (VIES), 'E' -> Exportación.
 * * @author Rentix 2026
 * @version 2026.2.0
 */
export enum ResidenceType {
  /**
   * @description R: Residente en España.
   * Sujeto a IVA nacional (incluye regímenes especiales de Canarias, Ceuta y Melilla).
   */
  RESIDENT = 'R',

  /**
   * @description U: Residente en la Unión Europea.
   * Requiere validación de NIF-IVA en el censo VIES para exención de IVA.
   */
  EU_MEMBER = 'U',

  /**
   * @description E: Extracomunitario.
   * Operaciones fuera de la UE tratadas como exportaciones de servicios/bienes.
   */
  EXTRA_COMMUNITY = 'E',

  /**
   * @description O: Otros / No Residente sin establecimiento permanente.
   * Casos residuales según normativa técnica de la AEAT.
   */
  OTHER = 'O',
}
