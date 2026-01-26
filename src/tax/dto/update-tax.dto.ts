import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateTaxDto } from './create-tax.dto';

/**
 * @class UpdateTaxDto
 * @description DTO for partial modification of tax types.
 * Inherits strict validation and English naming convention from CreateTaxDto.
 * @version 2026.2.1
 */
export class UpdateTaxDto extends PartialType(CreateTaxDto) {
  /**
   * @description Operational availability control.
   * If false, the tax will be hidden from contract and invoice selectors in the Frontend.
   */
  @ApiPropertyOptional({
    description: 'Operational status of the tax',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}