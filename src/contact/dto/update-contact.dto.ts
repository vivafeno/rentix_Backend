import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateContactDto } from './create-contact.dto';

/**
 * @class UpdateContactDto
 * @description DTO para actualizaciones parciales. Incluye control de activación.
 */
export class UpdateContactDto extends PartialType(CreateContactDto) {

  @ApiPropertyOptional({
    description: 'Estado de activación. Cambiar a false genera un borrado lógico (soft-delete).',
    example: true
  })
  @IsOptional()
  @IsBoolean({ message: 'validation.IS_BOOLEAN' })
  isActive?: boolean;
}