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
 * @description DTO para la creación de tipos impositivos.
 * Sincronizado con el motor de facturación Veri*factu.
 * @version 2026.2.0
 */
export class CreateTaxDto {
  @ApiProperty({
    example: 'IVA General 21%',
    description: 'Nombre descriptivo para la factura',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @Length(3, 50)
  nombre: string; // 🚩 Sincronizado: name -> nombre

  @ApiProperty({
    example: 21.0,
    description: 'Porcentaje impositivo (0 a 100)',
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  porcentaje: number; // 🚩 Sincronizado: rate -> porcentaje

  @ApiProperty({
    example: TaxType.IVA,
    enum: TaxType,
    enumName: 'TaxType',
    description: 'Categorización lógica del impuesto',
  })
  @IsEnum(TaxType)
  tipo: string; // 🚩 Sincronizado: type -> tipo

  @ApiPropertyOptional({
    example: false,
    default: false,
    description: 'Si es true, el valor resta de la base imponible',
  })
  @IsBoolean()
  @IsOptional()
  esRetencion?: boolean; // 🚩 Sincronizado: isRetention -> esRetencion

  @ApiPropertyOptional({
    example: '01',
    description: 'Código oficial FacturaE (IVA=01, IRPF=02)',
  })
  @IsString()
  @IsOptional()
  codigoFacturae?: string; // 🚩 Sincronizado: facturaeCode -> codigoFacturae

  /**
   * @description Campo Veri*factu: Requerido si el porcentaje es 0.
   */
  @ApiPropertyOptional({
    example: 'E1',
    description: 'Causa de exención AEAT (ej: E1 para alquiler vivienda)',
  })
  @IsString()
  @IsOptional()
  @Length(2, 5)
  causaExencion?: string;
}
