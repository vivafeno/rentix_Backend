/**
 * @description Tipologías de activos inmobiliarios.
 * Define el tratamiento fiscal automático (IVA/Retenciones) en Rentix 2026.
 * @author Rentix 2026
 * @version 2026.2.0
 */
export enum PropertyType {
  /**
   * @description Vivienda habitual o temporal.
   * FISCALIDAD: Generalmente EXENTO de IVA (Art. 20.Uno.23º Ley IVA).
   */
  RESIDENTIAL = 'VIVIENDA',

  /**
   * @description Locales comerciales u Oficinas.
   * FISCALIDAD: Sujeto a IVA (21%) y Retención IRPF.
   */
  COMMERCIAL = 'LOCAL_COMERCIAL',

  /**
   * @description Naves industriales o logísticas.
   */
  INDUSTRIAL = 'NAVE_INDUSTRIAL',

  /**
   * @description Plazas de garaje (Sujeto a IVA si es arrendamiento independiente).
   */
  PARKING = 'GARAJE',

  /**
   * @description Trasteros o almacenes pequeños.
   */
  STORAGE = 'TRASTERO',

  /**
   * @description Habitaciones (Coliving / Alquiler de temporada por estancias).
   */
  ROOM = 'HABITACION',

  /**
   * @description Terrenos, fincas rústicas o solares.
   */
  LAND = 'TERRENO',

  /**
   * @description Otros activos no categorizados.
   */
  OTHER = 'OTRO',
}