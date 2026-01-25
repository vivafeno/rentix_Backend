import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAddressDto } from './create-address.dto';

/**
 * @class UpdateAddressDto
 * @description DTO para la actualización parcial de direcciones.
 * Blindado para evitar el cambio de Tenant (companyId) y la naturaleza de la dirección (type).
 * @version 2026.2.2
 */
export class UpdateAddressDto extends PartialType(
  OmitType(CreateAddressDto, [
    'companyId', 
    'type'
  ] as const),
) {
  /**
   * Nota de Rigor:
   * Al usar OmitType primero, eliminamos la posibilidad de que se actualice
   * la pertenencia de la dirección o su categoría funcional.
   * PartialType hace que el resto (street, zipCode, etc.) sea opcional.
   */
}