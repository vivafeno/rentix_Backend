import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNumber,
  IsDateString,
  IsEnum,
  IsArray,
  IsOptional,
  IsInt,
  Min,
  Max,
  ArrayMinSize,
} from 'class-validator';
import {
  PaymentFrequency,
  PaymentMethod,
  ContractStatus,
} from '../enums'; // Asegúrate de que apunte a tus nuevos archivos de enums

/**
 * @class CreateContractDto
 * @description DTO de alta de contratos. Sincronizado 1:1 con la entidad Contract.
 * @version 2026.3.5
 */
export class CreateContractDto {

  /* --- VÍNCULOS (Naming coincidente con Entity) --- */

  @ApiProperty({ description: 'ID del inmueble' })
  @IsUUID('4')
  propertyId: string;

  @ApiProperty({ type: [String], description: 'IDs de inquilinos' })
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  tenantIds: string[]; // 🚩 Sincronizado con la relación "tenants" de la entidad

  /* --- ECONOMÍA --- */

  @ApiProperty({ example: 1200.0, description: 'Renta base' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  baseRent: number; // 🚩 Coincide con @Column({ name: 'base_rent' })

  @ApiPropertyOptional({ example: 1200.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  depositAmount?: number; // 🚩 Coincide con @Column({ name: 'deposit_amount' })

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  additionalGuarantee?: number;

  /* --- FISCALIDAD --- */

  @ApiProperty({ description: 'ID del IVA aplicable' })
  @IsUUID('4')
  taxIvaId: string; // 🚩 Coincide con @JoinColumn({ name: 'tax_iva_id' })

  @ApiPropertyOptional({ description: 'ID del IRPF' })
  @IsOptional()
  @IsUUID('4')
  taxIrpfId?: string;

  /* --- OPERATIVA --- */

  @ApiProperty({ enum: PaymentFrequency })
  @IsEnum(PaymentFrequency)
  paymentFrequency: PaymentFrequency; // 🚩 Sincronizado con el tipo de la entidad

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  @Max(28) // 🚩 Límite de rigor para seguridad en febrero
  billingDay: number;

  /* --- TEMPORALIDAD --- */

  @ApiProperty({ example: '2026-02-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2027-01-31' })
  @IsDateString()
  endDate: string; // 🚩 Eliminamos 'duracionMeses' para usar fecha de fin explícita

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  gracePeriodDays?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(15)
  noticePeriodDays?: number;

  @ApiPropertyOptional({ enum: ContractStatus, default: ContractStatus.DRAFT })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;
}