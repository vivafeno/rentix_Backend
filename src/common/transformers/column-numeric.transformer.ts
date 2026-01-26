export class ColumnNumericTransformer {
  /**
   * Se ejecuta al GUARDAR en la DB
   */
  to(data: number): number {
    return data;
  }

  /**
   * Se ejecuta al LEER de la DB
   */
  from(data: string): number {
    return parseFloat(data);
  }
}