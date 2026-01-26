import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsArray, 
  IsDateString, 
  IsEnum, 
  IsOptional, 
  IsUUID, 
  ValidateNested, 
  IsNumber, 
  IsString, 
  IsBoolean, 
  Min,
  Max
} from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceType } from '../enums';

/**
 * @description Sub-DTO para las líneas de detalle de la factura.
 * Se define primero para que CreateInvoiceDto pueda referenciarlo.
 */
export class CreateInvoiceItemDto {
  @ApiProperty({ example: 'RENT', description: 'Categoría técnica del cargo' })
  @IsString()
  category!: string;

  @ApiProperty({ example: 'Alquiler mensual - Enero 2026' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 1000.00, description: 'Precio unitario bruto' })
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @ApiPropertyOptional({ example: 0, description: 'Porcentaje de descuento (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discountPercentage?: number;

  @ApiProperty({ example: true, description: '¿Aplica IVA?' })
  @IsBoolean()
  applyTax!: boolean;

  @ApiProperty({ example: 21, description: 'Porcentaje de IVA' })
  @IsNumber()
  @Min(0)
  taxPercentage!: number;

  @ApiProperty({ example: false, description: '¿Aplica Retención IRPF?' })
  @IsBoolean()
  applyRetention!: boolean;

  @ApiPropertyOptional({ example: 19, description: 'Porcentaje de retención' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  retentionPercentage?: number;

  @ApiPropertyOptional({ example: 1, description: 'Mes del periodo (1-12)' })
  @IsNumber()
  @Min(1)
  @Max(12)
  @IsOptional()
  periodMonth?: number;

  @ApiPropertyOptional({ example: 2026 })
  @IsNumber()
  @IsOptional()
  periodYear?: number;
}

/**
 * @description DTO principal para la creación de facturas Rentix 2026.
 * RIGOR: Los campos inmutables (status, invoiceNumber) se gestionan en el Service.
 */
export class CreateInvoiceDto {
  @ApiProperty({ 
    enum: InvoiceType, 
    example: InvoiceType.ORDINARY,
    description: 'Tipo de factura según normativa legal' 
  })
  @IsEnum(InvoiceType)
  type!: InvoiceType;

  @ApiProperty({ 
    example: '2026-01-15', 
    description: 'Fecha de expedición' 
  })
  @IsDateString()
  issueDate!: string;

  @ApiPropertyOptional({ 
    example: '2026-01-01', 
    description: 'Fecha de la operación (devengo)' 
  })
  @IsOptional()
  @IsDateString()
  operationDate?: string;

  @ApiProperty({ description: 'ID del Cliente/Inquilino' })
  @IsUUID()
  clientId!: string;

  @ApiPropertyOptional({ description: 'ID de la propiedad' })
  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @ApiPropertyOptional({ description: 'ID del contrato origen' })
  @IsOptional()
  @IsUUID()
  contractId?: string;

  @ApiProperty({ 
    type: [CreateInvoiceItemDto], 
    description: 'Detalle de conceptos a facturar' 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto) // 🚩 Mapeo para validación recursiva
  items!: CreateInvoiceItemDto[];

  @ApiPropertyOptional({ example: 'Notas para el cliente...' })
  @IsOptional()
  @IsString()
  notes?: string;
}