import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';

/**
 * @class CreateBillingConceptDto
 * @description DTO para la creación de conceptos maestros de facturación.
 * Define la lógica de comportamiento (IVA/IRPF) para automatizar líneas de factura.
 */
export class CreateBillingConceptDto {
  @ApiProperty({ 
    description: 'Código identificador único (Slug)', 
    example: 'RENTA_MENSUAL' 
  })
  @IsString()
  @IsNotEmpty()
  name!: string; // 🚩 Rigor Rentix: !

  @ApiProperty({ 
    description: 'Texto descriptivo que aparecerá en la factura', 
    example: 'Alquiler mensual de vivienda/local' 
  })
  @IsString()
  @IsNotEmpty()
  label!: string; // 🚩 Rigor Rentix: !

  @ApiPropertyOptional({ 
    description: 'Precio base sugerido para el concepto', 
    example: 1200.0 
  })
  @IsNumber()
  @IsOptional()
  defaultPrice?: number;

  @ApiPropertyOptional({ 
    description: 'Obliga a especificar mes/año al usar este concepto', 
    example: true 
  })
  @IsBoolean()
  @IsOptional()
  requiresPeriod?: boolean;

  @ApiPropertyOptional({ 
    description: 'Impide cobrar este concepto dos veces en el mismo mes/año', 
    example: true 
  })
  @IsBoolean()
  @IsOptional()
  isUniquePerPeriod?: boolean;

  @ApiProperty({ 
    description: 'Naturaleza del ítem: P (Producto) / S (Servicio)', 
    enum: ['P', 'S'],
    example: 'S' 
  })
  @IsEnum(['P', 'S'], { message: 'itemType debe ser P (Producto) o S (Servicio)' })
  @IsNotEmpty()
  itemType!: string; // 🚩 Rigor Rentix: !

  @ApiProperty({ 
    description: 'ID del impuesto (IVA) por defecto para este concepto', 
    example: '550e8400-e29b-41d4-a716-446655440000' 
  })
  @IsUUID('4')
  @IsNotEmpty()
  defaultTaxId!: string; // 🚩 Rigor Rentix: !

  @ApiPropertyOptional({ 
    description: 'ID de la retención (IRPF) por defecto si aplica', 
    example: '661f9511-f30c-52e5-b827-557766551111' 
  })
  @IsUUID('4')
  @IsOptional()
  defaultRetentionId?: string;
}