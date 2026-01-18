import { PartialType } from '@nestjs/swagger';
import { CreateAddressDto } from './create-address.dto';

/**
 * @description DTO para la actualización parcial de direcciones.
 * Hereda todas las validaciones de CreateAddressDto, haciéndolas opcionales.
 * @version 2026.1.17
 */
export class UpdateAddressDto extends PartialType(CreateAddressDto) {}