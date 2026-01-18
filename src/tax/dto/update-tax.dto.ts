import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateTaxDto } from './create-tax.dto';

/**
 * DTO para actualización parcial de impuestos.
 * Extiende CreateTaxDto haciendo todos los campos opcionales
 * e incluye el control de estado heredado de BaseEntity.
 */
export class UpdateTaxDto extends PartialType(CreateTaxDto) {
  
  @ApiPropertyOptional({ 
    description: 'Permite activar o desactivar el impuesto para su uso en la plataforma',
    example: true 
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}