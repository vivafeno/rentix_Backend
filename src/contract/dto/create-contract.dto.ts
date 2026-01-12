import { ApiProperty } from '@nestjs/swagger';
import { 
  IsBoolean, 
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
  // --- IDENTIFICACIÓN ---
  @ApiProperty({ description: 'Referencia interna única', example: 'ALQ-2026/001' })
  @IsString()
  reference: string;

  @ApiProperty({ enum: ContractType, default: ContractType.ALQUILER })
  @IsEnum(ContractType)
  type: ContractType;

  // --- RELACIONES OBLIGATORIAS (Cierre de Seguridad) ---
  @ApiProperty({ description: 'UUID de la Empresa (Owner)' })
  @IsUUID()
  companyId: string;

  @ApiProperty({ description: 'UUID del Cliente (Inquilino)' })
  @IsUUID()
  clientId: string;

  @ApiProperty({ description: 'UUID de la Propiedad' })
  @IsUUID()
  propertyId: string;

  // --- ECONOMÍA & IMPUESTOS (Tax) ---
  @ApiProperty({ description: 'Renta mensual base', example: 1000.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monthlyRent: number;

  @ApiProperty({ description: 'Fianza', example: 2000.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  depositAmount: number;

  @ApiProperty({ description: 'UUID del Impuesto IVA (Tax Entity)' })
  @IsUUID()
  taxId: string;

  @ApiProperty({ description: 'UUID de la Retención IRPF (Tax Entity)', required: false })
  @IsOptional()
  @IsUUID()
  retentionId?: string;

  // --- OPERATIVA DE PAGO (Ajuste "Bak" a UUID) ---
  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'UUID de la Cuenta del Cliente (Seleccionada de su perfil)', required: false })
  @IsOptional()
  @IsUUID() // <--- CAMBIO: Forzamos UUID para evitar strings basura
  tenantBankAccountId?: string;

  @ApiProperty({ description: 'UUID de la Cuenta de la Empresa (Seleccionada de su perfil)', required: false })
  @IsOptional()
  @IsUUID() // <--- CAMBIO: Forzamos UUID
  companyBankAccountId?: string;

  // --- CICLO DE VIDA ---
  @ApiProperty({ enum: ContractStatus, default: ContractStatus.BORRADOR })
  @IsEnum(ContractStatus)
  status: ContractStatus;

  @ApiProperty({ description: 'Fecha inicio (YYYY-MM-DD)', example: '2026-01-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Fecha fin (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Día de cobro programado (1-28)', example: 1 })
  @IsInt()
  @Min(1)
  @Max(28)
  billingDay: number;

  @ApiProperty({ enum: BillingPeriod })
  @IsEnum(BillingPeriod)
  billingPeriod: BillingPeriod;

  // --- AUTOMATIZACIÓN ---
  @ApiProperty({ description: 'Activar facturación automática', default: false })
  @IsOptional()
  @IsBoolean()
  isAutoBillingEnabled?: boolean;

  @ApiProperty({ description: 'Fecha límite autofacturación', required: false })
  @IsOptional()
  @IsDateString()
  autoBillingUntil?: string;

  @ApiProperty({ description: 'URL del documento firmado', required: false })
  @IsOptional()
  @IsString()
  documentUrl?: string;
}