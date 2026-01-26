import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsOptional,
  Min,
  Max,
  Length,
} from 'class-validator';
import { TaxType } from '../enums/tax-type.enum';

/**
 * @class CreateTaxDto
 * @description DTO for tax creation.
 * Normalized to English for global compatibility and Signal-Store integration.
 * @version 2026.2.1
 */
export class CreateTaxDto {
  @ApiProperty({
    example: 'General VAT 21%',
    description: 'Descriptive name for the invoice line',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @Length(3, 50)
  name!: string; // ✅ Fixed: nombre -> name

  @ApiProperty({
    example: 21.0,
    description: 'Tax percentage (0 to 100)',
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage!: number; // ✅ Fixed: porcentaje -> percentage

  @ApiProperty({
    example: TaxType.IVA,
    enum: TaxType,
    enumName: 'TaxType',
    description: 'Logical tax category',
  })
  @IsEnum(TaxType)
  type!: TaxType; // ✅ Fixed: tipo -> type

  @ApiPropertyOptional({
    example: false,
    default: false,
    description: 'If true, value is subtracted from tax base (Withholding)',
  })
  @IsBoolean()
  @IsOptional()
  isRetention?: boolean; // ✅ Fixed: esRetencion -> isRetention

  @ApiPropertyOptional({
    example: '01',
    description: 'Official FacturaE code (VAT=01, IRPF=02)',
  })
  @IsString()
  @IsOptional()
  facturaECode?: string; // ✅ Fixed: codigoFacturae -> facturaECode

  /**
   * @description Verifactu field: Required if percentage is 0.
   */
  @ApiPropertyOptional({
    example: 'E1',
    description: 'AEAT exemption cause (e.g., E1 for residential rental)',
  })
  @IsString()
  @IsOptional()
  @Length(2, 5)
  exemptionCause?: string; // ✅ Fixed: causaExencion -> exemptionCause
}