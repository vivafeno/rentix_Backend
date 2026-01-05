import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsEnum,
  IsString,
  IsDateString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';

import { ContractType, ContractStatus, BillingPeriod } from '../enums';

/**
 * DTO para crear un contrato.
 *
 * Define el conjunto mínimo de datos necesarios para que
 * un contrato sea válido desde el momento de su creación.
 */
export class CreateContractDto {

  /* ─────────────────────────────────────
   * RELACIONES
   * ───────────────────────────────────── */

  @ApiProperty({
    description: 'Cliente asociado al contrato',
    format: 'uuid',
  })
  @IsUUID()
  clientProfileId: string;

  @ApiProperty({
    description: 'Inmueble asociado al contrato',
    format: 'uuid',
  })
  @IsUUID()
  propertyId: string;

  /* ─────────────────────────────────────
   * IDENTIFICACIÓN
   * ───────────────────────────────────── */

  @ApiProperty({
    description: 'Número o referencia interna del contrato',
    example: 'CTR-2024-001',
  })
  @IsString()
  numeroContrato: string;

  /* ─────────────────────────────────────
   * TIPO Y ESTADO
   * ───────────────────────────────────── */

  @ApiProperty({
    enum: ContractType,
    description: 'Tipo de contrato',
  })
  @IsEnum(ContractType)
  tipoContrato: ContractType;

  @ApiProperty({
    enum: ContractStatus,
    description: 'Estado inicial del contrato',
    example: ContractStatus.ACTIVO,
  })
  @IsEnum(ContractStatus)
  estadoContrato: ContractStatus;

  /* ─────────────────────────────────────
   * FECHAS
   * ───────────────────────────────────── */

  @ApiProperty({
    description: 'Fecha de firma del contrato',
    example: '2024-01-15',
  })
  @IsDateString()
  fechaFirma: string;

  @ApiProperty({
    description: 'Fecha de inicio del contrato',
    example: '2024-02-01',
  })
  @IsDateString()
  fechaInicio: string;

  @ApiProperty({
    description: 'Duración inicial del contrato en meses',
    example: 12,
  })
  @IsNumber()
  @Min(1)
  duracionMeses: number;

  @ApiProperty({
    description: 'Fecha de finalización prevista del contrato',
    example: '2025-01-31',
  })
  @IsDateString()
  fechaFin: string;

  /* ─────────────────────────────────────
   * CONDICIONES ECONÓMICAS
   * ───────────────────────────────────── */

  @ApiProperty({
    description: 'Importe base del contrato sin impuestos',
    example: 750,
  })
  @IsNumber()
  @Min(0)
  importeBase: number;

  @ApiProperty({
    enum: BillingPeriod,
    description: 'Periodicidad de facturación',
  })
  @IsEnum(BillingPeriod)
  periodicidad: BillingPeriod;

  /* ─────────────────────────────────────
   * IMPUESTOS (CATÁLOGOS FISCALES)
   * ───────────────────────────────────── */

  @ApiProperty({
    description: 'ID del tipo de IVA aplicable (catálogo VAT)',
    format: 'uuid',
  })
  @IsUUID()
  vatRateId: string;

  @ApiProperty({
    description: 'ID del tipo de retención aplicable (catálogo Withholding)',
    format: 'uuid',
  })
  @IsUUID()
  withholdingRateId: string;

  /* ─────────────────────────────────────
   * CONDICIONES ADICIONALES (OPCIONALES)
   * ───────────────────────────────────── */

  @ApiProperty({
    required: false,
    description: 'Importe entregado como fianza',
    example: 1500,
  })
  @IsOptional()
  @IsNumber()
  fianzaImporte?: number;

  @ApiProperty({
    required: false,
    description: 'Meses de carencia sin facturación',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  mesesCarencia?: number;

  /* ─────────────────────────────────────
   * AVISOS Y REVISIÓN
   * ───────────────────────────────────── */

  @ApiProperty({
    required: false,
    description: 'Avisar antes de la finalización del contrato',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  avisarFinContrato?: boolean;

  @ApiProperty({
    required: false,
    description: 'Indica si el contrato tiene revisión IPC',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  revisionIpcActiva?: boolean;

  @ApiProperty({
    required: false,
    description: 'Fecha prevista de revisión IPC',
    example: '2025-02-01',
  })
  @IsOptional()
  @IsDateString()
  fechaRevisionIpc?: string;

  @ApiProperty({
    required: false,
    description: 'Avisar cuando llegue la revisión IPC',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  avisarRevisionIpc?: boolean;

  /* ─────────────────────────────────────
   * OTROS
   * ───────────────────────────────────── */

  @ApiProperty({
    required: false,
    description: 'Descripción de gastos adicionales',
  })
  @IsOptional()
  @IsString()
  gastosDescripcion?: string;

  @ApiProperty({
    required: false,
    description: 'Observaciones generales del contrato',
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
