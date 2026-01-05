import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/base/base.entity';
import { Company } from 'src/company/entities/company.entity';
import { ClientProfile } from 'src/client-profile/entities/client-profile.entity';
import { Property } from 'src/property/entities/property.entity';

import { ContractType, ContractStatus, BillingPeriod } from '../enums';
import { VatRate } from 'src/common/catalogs/taxes/vat-rate/vat-rate.entity';
import { WithholdingRate } from 'src/common/catalogs/taxes/withholding-rate/withholding-rate.entity';

@Entity('contracts')
@Index(['companyId'])
@Index(['propertyId'])
@Index(['numeroContrato'])
@Index(['vatRateId'])
@Index(['withholdingRateId'])
export class Contract extends BaseEntity {

  /* ─────────────────────────────────────
   * RELACIONES PRINCIPALES
   * ───────────────────────────────────── */

  @ApiProperty({ description: 'Empresa propietaria del contrato', format: 'uuid' })
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ApiProperty({ description: 'Cliente asociado al contrato', format: 'uuid' })
  @Column({ name: 'client_profile_id', type: 'uuid' })
  clientProfileId: string;

  @ManyToOne(() => ClientProfile, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'client_profile_id' })
  clientProfile: ClientProfile;

  @ApiProperty({ description: 'Inmueble asociado al contrato', format: 'uuid' })
  @Column({ name: 'property_id', type: 'uuid' })
  propertyId: string;

  @ManyToOne(() => Property, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  /* ─────────────────────────────────────
   * IDENTIFICACIÓN
   * ───────────────────────────────────── */

  @ApiProperty({
    description: 'Número o referencia interna del contrato',
    example: 'CTR-2024-001',
  })
  @Column({ name: 'numero_contrato' })
  numeroContrato: string;

  /* ─────────────────────────────────────
   * TIPO Y ESTADO
   * ───────────────────────────────────── */

  @ApiProperty({
    enum: ContractType,
    description: 'Tipo de contrato (alquiler, cesión, etc.)',
  })
  @Column({ type: 'enum', enum: ContractType })
  tipoContrato: ContractType;

  @ApiProperty({
    enum: ContractStatus,
    description: 'Estado actual del contrato',
  })
  @Column({ type: 'enum', enum: ContractStatus })
  estadoContrato: ContractStatus;

  /* ─────────────────────────────────────
   * FECHAS CONTRACTUALES
   * ───────────────────────────────────── */

  @ApiProperty({ example: '2024-01-15', description: 'Fecha de firma del contrato' })
  @Column({ name: 'fecha_firma', type: 'date' })
  fechaFirma: Date;

  @ApiProperty({ example: '2024-02-01', description: 'Fecha de inicio del contrato' })
  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio: Date;

  @ApiProperty({
    example: 12,
    description: 'Duración inicial del contrato en meses',
  })
  @Column({ name: 'duracion_meses', type: 'int' })
  duracionMeses: number;

  @ApiProperty({
    example: '2025-01-31',
    description: 'Fecha de finalización prevista del contrato',
  })
  @Column({ name: 'fecha_fin', type: 'date' })
  fechaFin: Date;

  @ApiProperty({
    example: '2024-10-15',
    required: false,
    description: 'Fecha de rescisión anticipada, si aplica',
  })
  @Column({ name: 'fecha_rescision', type: 'date', nullable: true })
  fechaRescision?: Date;

  /* ─────────────────────────────────────
   * RENOVACIÓN Y PREAVISO
   * ───────────────────────────────────── */

  @ApiProperty({
    example: true,
    description: 'Indica si el contrato se renueva automáticamente',
  })
  @Column({ name: 'renovacion_automatica', default: false })
  renovacionAutomatica: boolean;

  @ApiProperty({
    example: 2,
    required: false,
    description: 'Meses de preaviso requeridos',
  })
  @Column({ name: 'preaviso_meses', type: 'int', nullable: true })
  preavisoMeses?: number;

  /* ─────────────────────────────────────
   * CONDICIONES ECONÓMICAS
   * ───────────────────────────────────── */

  @ApiProperty({
    example: 750,
    description: 'Importe base sin impuestos',
  })
  @Column({ name: 'importe_base', type: 'decimal', precision: 10, scale: 2 })
  importeBase: number;

  @ApiProperty({
    example: 'EUR',
    description: 'Moneda del contrato (ISO-4217)',
  })
  @Column({ length: 3, default: 'EUR' })
  moneda: string;

  @ApiProperty({
    enum: BillingPeriod,
    description: 'Periodicidad de facturación',
  })
  @Column({ type: 'enum', enum: BillingPeriod })
  periodicidad: BillingPeriod;

  /* ─────────────────────────────────────
   * IMPUESTOS (CATÁLOGOS)
   * ───────────────────────────────────── */

  @ApiProperty({
    description: 'Tipo de IVA aplicado al contrato',
    format: 'uuid',
  })
  @Column({ name: 'vat_rate_id', type: 'uuid' })
  vatRateId: string;

  @ManyToOne(() => VatRate)
  @JoinColumn({ name: 'vat_rate_id' })
  vatRate: VatRate;

  @ApiProperty({
    description: 'Tipo de retención aplicado al contrato',
    format: 'uuid',
  })
  @Column({ name: 'withholding_rate_id', type: 'uuid' })
  withholdingRateId: string;

  @ManyToOne(() => WithholdingRate)
  @JoinColumn({ name: 'withholding_rate_id' })
  withholdingRate: WithholdingRate;

  /* ─────────────────────────────────────
   * FIANZA Y CARENCIA
   * ───────────────────────────────────── */

  @ApiProperty({
    example: 1500,
    required: false,
    description: 'Importe entregado como fianza',
  })
  @Column({
    name: 'fianza_importe',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  fianzaImporte?: number;

  @ApiProperty({
    example: 2,
    description: 'Meses de carencia sin facturación',
  })
  @Column({ name: 'meses_carencia', type: 'int', default: 0 })
  mesesCarencia: number;

  /* ─────────────────────────────────────
   * AVISOS Y REVISIÓN
   * ───────────────────────────────────── */

  @ApiProperty({
    example: true,
    description: 'Avisar antes de la finalización del contrato',
  })
  @Column({ name: 'avisar_fin_contrato', default: true })
  avisarFinContrato: boolean;

  @ApiProperty({
    example: true,
    description: 'Indica si el contrato tiene revisión IPC',
  })
  @Column({ name: 'revision_ipc_activa', default: false })
  revisionIpcActiva: boolean;

  @ApiProperty({
    example: '2025-02-01',
    required: false,
    description: 'Fecha prevista de revisión IPC',
  })
  @Column({ name: 'fecha_revision_ipc', type: 'date', nullable: true })
  fechaRevisionIpc?: Date;

  @ApiProperty({
    example: true,
    description: 'Avisar cuando llegue la revisión IPC',
  })
  @Column({ name: 'avisar_revision_ipc', default: true })
  avisarRevisionIpc: boolean;

  /* ─────────────────────────────────────
   * OBSERVACIONES
   * ───────────────────────────────────── */

  @ApiProperty({
    required: false,
    description: 'Descripción de gastos adicionales',
  })
  @Column({ name: 'gastos_descripcion', type: 'text', nullable: true })
  gastosDescripcion?: string;

  @ApiProperty({
    required: false,
    description: 'Observaciones generales del contrato',
  })
  @Column({ type: 'text', nullable: true })
  observaciones?: string;
}
