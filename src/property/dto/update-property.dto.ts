import { PartialType } from '@nestjs/swagger';
import { CreatePropertyDto } from './create-property.dto';

/**
 * DTO para la actualización parcial de activos inmobiliarios.
 * * Estándares Blueprint 2026:
 * - Hereda todas las validaciones de CreatePropertyDto mediante PartialType.
 * - Todos los campos se transforman en opcionales (@IsOptional).
 * - Mantiene la integridad de los tipos de datos en operaciones PATCH.
 * * @author Rentix
 */
export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}