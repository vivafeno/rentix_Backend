export enum PropertyType {
  /**
   * Vivienda habitual o temporal.
   * FISCALIDAD: Generalmente EXENTO de IVA (salvo servicios hoteleros).
   */
  RESIDENTIAL = 'RESIDENTIAL', // Antes: VIVIENDA

  /**
   * Locales comerciales u Oficinas.
   * FISCALIDAD: Sujeto a IVA (21%) y Retención IRPF (19%).
   */
  COMMERCIAL = 'COMMERCIAL',   // Antes: LOCAL_COMERCIAL

  /**
   * Naves industriales o logísticas.
   * FISCALIDAD: Sujeto a IVA.
   */
  INDUSTRIAL = 'INDUSTRIAL',

  /**
   * Plazas de garaje.
   * FISCALIDAD: Si se alquila junto a vivienda (mismo contrato) es exento. Suelto lleva IVA.
   */
  PARKING = 'PARKING',         // Antes: GARAJE

  /**
   * Trasteros o almacenes pequeños.
   */
  STORAGE = 'STORAGE',         // Antes: TRASTERO

  /**
   * Habitaciones (Coliving / Estudiantes).
   * TENDENCIA: Cada vez más común, requiere contratos distintos a la LAU estándar.
   */
  ROOM = 'ROOM', 

  /**
   * Terrenos, fincas rústicas o solares.
   */
  LAND = 'LAND',               // Antes: TERRENO

  OTRO = 'OTHER',              // Antes: OTRO
}