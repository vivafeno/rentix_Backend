import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateTaxDto } from './create-tax.dto';

/**
 * @class UpdateTaxDto
 * @description DTO para la modificación parcial de tipos impositivos.
 * Hereda la validación estricta y el tipado Veri*factu del CreateTaxDto.
 * @version 2026.2.0
 */
export class UpdateTaxDto extends PartialType(CreateTaxDto) {
  
  /**
   * @description Control de disponibilidad operativa.
   * Si es false, el impuesto no aparecerá en el selector de contratos/facturas.
   */
  @ApiPropertyOptional({ 
    description: 'Estado de disponibilidad operativa del impuesto',
    example: true 
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}