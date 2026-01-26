import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsISO31661Alpha2,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';

/**
 * @class CreateWithholdingRateDto
 * @description DTO para la creación de tipos de retención (IRPF, etc.).
 * Rigor 2026: Validación estricta de porcentajes y códigos de país ISO.
 */
export class CreateWithholdingRateDto {
  @ApiProperty({
    description: 'Siglas del tipo de retención (ej. IRPF, IRPF_ALQ)',
    example: 'IRPF',
  })
  @IsString()
  @IsNotEmpty()
  tipo!: string; // 🚩 Rigor Rentix: ! para TS strict

  @ApiProperty({
    description: 'Descripción detallada de la retención para facturación',
    example: 'Retención IRPF general para arrendamientos',
  })
  @IsString()
  @IsNotEmpty()
  descripcion!: string; // 🚩 Rigor Rentix: !

  @ApiProperty({
    description: 'Porcentaje a aplicar (0 a 100)',
    example: 19,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  porcentaje!: number; // 🚩 Rigor Rentix: !

  @ApiProperty({
    description: 'Código de país ISO-3166-1 alpha-2 (Obligatorio para Veri*factu)',
    example: 'ES',
  })
  @IsISO31661Alpha2({ message: 'El código de país debe ser un estándar ISO Alpha-2 válido' })
  @IsNotEmpty()
  countryCode!: string; // 🚩 Rigor Rentix: !

  @ApiPropertyOptional({
    description: 'Marca esta retención como la predeterminada para nuevos contratos',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: 'Estado operativo de la retención',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}