import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsBoolean, 
  IsEnum, 
  IsInt, 
  IsNumber, 
  IsOptional, 
  IsString, 
  Max, 
  Min 
} from 'class-validator';

/**
 * @description DTO para la creación de líneas de detalle en una factura.
 * Permite definir la lógica de impuestos y periodos de forma individual.
 */
export class CreateInvoiceItemDto {
  @ApiProperty({ example: 'RENT', description: 'Categoría del concepto' })
  @IsString()
  category: string;

  @ApiProperty({ example: 'Alquiler mensual Enero 2026', description: 'Descripción detallada' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 1, description: 'Mes del periodo (1-12)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  periodMonth?: number;

  @ApiPropertyOptional({ example: 2026, description: 'Año del periodo' })
  @IsOptional()
  @IsInt()
  @Min(2000)
  periodYear?: number;

  @ApiProperty({ example: 1, description: 'Número de cuota actual' })
  @IsInt()
  @Min(1)
  currentInstallment: number = 1;

  @ApiProperty({ example: 1, description: 'Total de cuotas' })
  @IsInt()
  @Min(1)
  totalInstallments: number = 1;

  @ApiProperty({ example: 1000.00, description: 'Precio unitario bruto' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ example: 0, description: 'Porcentaje de descuento' })
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage: number = 0;

  @ApiProperty({ example: true, description: '¿Aplica IVA?' })
  @IsBoolean()
  applyTax: boolean = true;

  @ApiProperty({ example: 21, description: 'Porcentaje de IVA' })
  @IsNumber()
  taxPercentage: number = 0;

  @ApiProperty({ example: false, description: '¿Aplica Retención?' })
  @IsBoolean()
  applyRetention: boolean = false;

  @ApiProperty({ example: 19, description: 'Porcentaje de retención' })
  @IsNumber()
  retentionPercentage: number = 0;
}