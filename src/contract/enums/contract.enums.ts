/**
 * @description Periodicidad de la generación de facturas.
 * Determina el ciclo de vida del motor de facturación automática.
 */
export enum FrecuenciaPago {
  MENSUAL = 'MENSUAL',
  BIMENSUAL = 'BIMENSUAL',
  TRIMESTRAL = 'TRIMESTRAL',
  SEMESTRAL = 'SEMESTRAL',
  ANUAL = 'ANUAL',
}

/**
 * @description Métodos de pago soportados para la liquidación de rentas.
 * Crucial para el cumplimiento de FacturaE y automatización de remesas SEPA.
 */
export enum MetodoPago {
  TRANSFERENCIA = 'TRANSFERENCIA',
  DOMICILIACION = 'DOMICILIACION',
  INGRESO_CUENTA = 'INGRESO_CUENTA',
  EFECTIVO = 'EFECTIVO',
  TARJETA = 'TARJETA',
  BIZUM = 'BIZUM',
}

/**
 * @description Estado administrativo del contrato.
 */
export enum ContractStatus {
  BORRADOR = 'BORRADOR',
  ACTIVO = 'ACTIVO',
  FINALIZADO = 'FINALIZADO',
  RESCINDIDO = 'RESCINDIDO',
}