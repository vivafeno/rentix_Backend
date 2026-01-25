import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { CreatePropertyDto } from './create-property.dto';

/**
 * @class UpdatePropertyDto
 * @description DTO para la actualización parcial de activos (PATCH).
 * Blindado para evitar el cambio de Tenant (companyId) y Código Interno.
 * @author Rentix 2026
 * @version 2026.2.3
 */
export class UpdatePropertyDto extends PartialType(
  OmitType(CreatePropertyDto, ['companyId', 'internalCode'] as const),
) {
  /**
   * Nota de Rigor: 
   * La dirección (address) se hereda como opcional y validada anidada, 
   * lo que permite actualizar la calle sin afectar al ID del inmueble.
   */
}