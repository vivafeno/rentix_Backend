import { PartialType } from '@nestjs/swagger';
import { CreatePropertyDto } from './create-property.dto';

/**
 * @class UpdatePropertyDto
 * @description DTO para la actualización parcial de activos (PATCH).
 * Hereda la estructura normalizada en castellano y Veri*factu Ready.
 * @author Rentix 2026
 * @version 2026.2.0
 */
export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}
