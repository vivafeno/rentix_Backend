export enum PaymentMethod {
  EFECTIVO = '01',
  TRANSFERENCIA = '02',
  DOMICILIACION = '03', // El más común para alquileres (Adeudo SEPA)
  TARJETA = '04',
  CHEQUE = '08',
  COMPENSACION = '09', // Por si se compensan deudas
  OTRO = '99',
}
