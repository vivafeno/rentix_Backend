import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { CreateReceiptDto } from './create-receipt.dto';

/**
 * @class UpdateReceiptDto
 * @description Esquema para la edición de recibos emitidos.
 * 🛡️ Rigor 2026: Se omiten 'amount' y 'type' para preservar la integridad financiera.
 * Si el importe es erróneo, se debe anular el recibo y emitir uno nuevo.
 */
export class UpdateReceiptDto extends PartialType(
  OmitType(CreateReceiptDto, ['amount', 'type'] as const),
) {
  // Los campos 'concept', 'tenantId' y 'manualTenantName' 
  // se heredan como opcionales automáticamente.
}