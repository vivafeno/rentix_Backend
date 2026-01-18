import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNumber,
  IsDateString,
  IsEnum,
  IsArray,
  IsOptional,
  Min,
  Max,
  ArrayMinSize,
} from 'class-validator';
import {
  FrecuenciaPago,
  MetodoPago,
  ContractStatus,
} from '../enums/contract.enums';

/**
 * @class CreateContractDto
 * @description Contrato de entrada para la creación de nuevos arrendamientos.
 * Incluye metadatos para la generación estricta de tipos en Angular.
 */
export class CreateContractDto {
  @ApiProperty({ description: 'ID del inmueble objeto del alquiler' })
  @IsUUID()
  propertyId: string;

  @ApiProperty({
    type: [String],
    description: 'IDs de los inquilinos firmantes (Mínimo 1)',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  inquilinosIds: string[];

  /* --- CONDICIONES ECONÓMICAS --- */

  @ApiProperty({ example: 1200.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  rentaMensual: number;

  @ApiPropertyOptional({ example: 2400.0, default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  fianza?: number;

  @ApiProperty({ description: 'ID del impuesto IVA (Tax)' })
  @IsUUID()
  taxIvaId: string;

  @ApiPropertyOptional({ description: 'ID del impuesto IRPF (Tax)' })
  @IsOptional()
  @IsUUID()
  taxIrpfId?: string;

  /* --- CONFIGURACIÓN DE FACTURACIÓN --- */

  @ApiProperty({
    enum: FrecuenciaPago,
    enumName: 'FrecuenciaPago', // 🚩 Clave para ng-openapi-gen
    default: FrecuenciaPago.MENSUAL,
  })
  @IsEnum(FrecuenciaPago)
  frecuenciaPago: FrecuenciaPago;

  @ApiProperty({
    enum: MetodoPago,
    enumName: 'MetodoPago', // 🚩 Clave para ng-openapi-gen
    default: MetodoPago.TRANSFERENCIA,
  })
  @IsEnum(MetodoPago)
  metodoPago: MetodoPago;

  @ApiProperty({ example: 5, description: 'Día del mes para emitir factura' })
  @IsNumber()
  @Min(1)
  @Max(31)
  diaFacturacion: number;

  /* --- TEMPORALIDAD --- */

  @ApiProperty({ example: '2026-02-01' })
  @IsDateString()
  fechaInicio: string;

  @ApiProperty({ example: 12, description: 'Vigencia en meses' })
  @IsNumber()
  @Min(1)
  duracionMeses: number;

  @ApiPropertyOptional({
    enum: ContractStatus,
    enumName: 'ContractStatus', // 🚩 Clave para ng-openapi-gen
    default: ContractStatus.ACTIVO,
  })
  @IsOptional()
  @IsEnum(ContractStatus)
  estado?: ContractStatus;
}
