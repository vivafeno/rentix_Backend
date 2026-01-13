import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min
} from 'class-validator';
import {
  ContractStatus,
  BillingPeriod,
  ContractType,
  PaymentMethod
} from '../enums';

export class CreateContractDto {
  // --------------------------------------------------------------------------
  // IDENTIFICACIÓN
  // --------------------------------------------------------------------------
  @ApiProperty({ description: 'Referencia interna única', example: 'ALQ-2026/001' })
  @IsString()
  reference: string;

  @ApiProperty({ enum: ContractType, default: ContractType.ALQUILER })
  @IsEnum(ContractType)
  type: ContractType;

  // --------------------------------------------------------------------------
  // RELACIONES (IDs UUID)
  // --------------------------------------------------------------------------
  @ApiProperty({ description: 'UUID de la Empresa (Owner)' })
  @IsUUID()
  companyId: string;

  @ApiProperty({ description: 'UUID del Cliente (Inquilino)' })
  @IsUUID()
  clientId: string;

  @ApiProperty({ description: 'UUID de la Propiedad' })
  @IsUUID()
  propertyId: string;

  // --------------------------------------------------------------------------
  // ECONOMÍA
  // --------------------------------------------------------------------------
  @ApiProperty({ description: 'Renta mensual base', example: 1000.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monthlyRent: number;

  @ApiProperty({ description: 'Fianza', example: 2000.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  depositAmount: number;

  // --------------------------------------------------------------------------
  // IMPUESTOS (Tax Entity)
  // --------------------------------------------------------------------------
  @ApiProperty({ description: 'UUID del Impuesto IVA (Tax Entity)' })
  @IsUUID()
  taxId: string;

  @ApiProperty({ description: 'UUID de la Retención IRPF (Tax Entity)', required: false })
  @IsOptional()
  @IsUUID()
  retentionId?: string;

  // --------------------------------------------------------------------------
  // OPERATIVA DE PAGO (Bancos)
  // --------------------------------------------------------------------------
  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'UUID de la Cuenta del Cliente (Para domiciliar)', required: false })
  @IsOptional()
  @IsUUID()
  tenantBankAccountId?: string;

  @ApiProperty({ description: 'UUID de la Cuenta de la Empresa (Para recibir transf.)', required: false })
  @IsOptional()
  @IsUUID()
  companyBankAccountId?: string;

  // --------------------------------------------------------------------------
  // CICLO DE VIDA & FECHAS
  // --------------------------------------------------------------------------
  @ApiProperty({ enum: ContractStatus, default: ContractStatus.BORRADOR })
  @IsEnum(ContractStatus)
  status: ContractStatus;

  @ApiProperty({ example: '2026-01-01' })
  @Type(() => Date) // 👈 "Magia": Convierte el string entrante a Date
  @IsDate()         // Valida que sea un objeto Date real
  startDate: Date;  // 👈 Ahora sí podemos decir que es Date

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiProperty({ description: 'Día de cobro programado (1-28)', example: 1 })
  @IsInt()
  @Min(1)
  @Max(28)
  billingDay: number;

  @ApiProperty({ enum: BillingPeriod })
  @IsEnum(BillingPeriod)
  billingPeriod: BillingPeriod;

  // --------------------------------------------------------------------------
  // AUTOMATIZACIÓN
  // --------------------------------------------------------------------------
  @ApiProperty({ description: 'Activar facturación automática', default: false })
  @IsOptional()
  @IsBoolean()
  isAutoBillingEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  autoBillingUntil?: Date;

  // --------------------------------------------------------------------------
  // DOCUMENTACIÓN
  // --------------------------------------------------------------------------
  @ApiProperty({ description: 'URL del documento firmado', required: false })
  @IsOptional()
  @IsString()
  documentUrl?: string;
}