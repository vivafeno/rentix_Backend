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
 * @class CreateVatRateDto
 * @description DTO para la creación de tipos de IVA (General, Reducido, etc.).
 * Rigor 2026: Blindaje de porcentajes impositivos y cumplimiento ISO para AEAT.
 */
export class CreateVatRateDto {
  @ApiProperty({
    description: 'Siglas identificadoras del tipo de IVA',
    example: 'IVA_GENERAL',
  })
  @IsString()
  @IsNotEmpty()
  tipo!: string; // 🚩 Rigor Rentix: ! para TS strict

  @ApiProperty({
    description: 'Descripción legible para impresión en facturas',
    example: 'IVA General (21%)',
  })
  @IsString()
  @IsNotEmpty()
  descripcion!: string; // 🚩 Rigor Rentix: !

  @ApiProperty({
    description: 'Porcentaje de IVA a aplicar',
    example: 21,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  porcentaje!: number; // 🚩 Rigor Rentix: !

  @ApiProperty({
    description: 'Código de país ISO-3166-1 alpha-2',
    example: 'ES',
  })
  @IsISO31661Alpha2({ message: 'El código de país debe ser un estándar ISO Alpha-2 válido' })
  @IsNotEmpty()
  countryCode!: string; // 🚩 Rigor Rentix: !

  @ApiPropertyOptional({
    description: 'Establece este IVA como predeterminado en la facturación de la empresa',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: 'Estado de disponibilidad del impuesto',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}