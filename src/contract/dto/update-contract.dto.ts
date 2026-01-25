import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateContractDto } from './create-contract.dto';

/**
 * @class UpdateContractDto
 * @description DTO para la actualización de condiciones contractuales.
 * Blindado para proteger la inmutabilidad del activo, los intervinientes y el histórico fiscal.
 * @version 2026.3.2
 */
export class UpdateContractDto extends PartialType(
  OmitType(CreateContractDto, [
    'propertyId',   // Un contrato no puede saltar de un piso a otro.
    'tenantIds',    // Los inquilinos firmantes originales no se cambian (se hace anexo).
    'startDate',    // Cambiar el inicio con facturas emitidas es un error contable.
    'taxIvaId',     // La naturaleza fiscal del contrato debe ser estable.
  ] as const),
) {
  /**
   * Nota de Rigor:
   * Sí permitimos actualizar: baseRent (subidas de IPC), paymentMethod, 
   * noticePeriodDays y status.
   */
}