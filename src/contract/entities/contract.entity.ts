import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Company } from '../../company/entities/company.entity';
import { Property } from '../../property/entities/property.entity';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { Tax } from '../../tax/entities/tax.entity';
import {
  PaymentFrequency,
  PaymentMethod,
  ContractStatus,
} from '../enums';

/**
 * @class Contract
 * @description Entidad maestra de arrendamiento. 
 * Eje central de la generación de ingresos y cumplimiento fiscal 2026.
 */
@Entity('contracts')
export class Contract extends BaseEntity {

  /* ─────────────────────────────────────────────────────────────────
   * 🏢 CONTEXTO Y SEGURIDAD (MULTI-TENANCY)
   * ───────────────────────────────────────────────────────────────── */

  @Index()
  @Column({ name: 'company_id', type: 'uuid' })
  @ApiProperty({ description: 'ID de la empresa propietaria del contrato' })
  companyId!: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  @ApiProperty({ type: () => Company })
  company!: Company;

  /* ─────────────────────────────────────────────────────────────────
   * 🏠 VÍNCULOS OPERATIVOS
   * ───────────────────────────────────────────────────────────────── */

  @Column({ name: 'property_id', type: 'uuid' })
  @ApiProperty({ description: 'ID del activo inmobiliario' })
  propertyId!: string;

  @ManyToOne(() => Property, { eager: false })
  @JoinColumn({ name: 'property_id' })
  @ApiProperty({ type: () => Property })
  property!: Property;

  @ManyToMany(() => Tenant, (tenant) => tenant.contracts, { eager: true })
  @JoinTable({
    name: 'contract_tenants',
    joinColumn: { name: 'contract_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tenant_id', referencedColumnName: 'id' },
  })
  @ApiProperty({ type: () => [Tenant], description: 'Inquilinos firmantes del contrato' })
  tenants!: Tenant[];

  /* ─────────────────────────────────────────────────────────────────
   * 💰 ECONOMÍA (RIGOR FINANCIERO)
   * ───────────────────────────────────────────────────────────────── */

  @ApiProperty({ description: 'Renta base mensual (sin impuestos)', example: 1200.00 })
  @Column({
    name: 'base_rent',
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  baseRent!: number;

  @ApiProperty({ description: 'Importe de la fianza legal', example: 2400.00 })
  @Column({
    name: 'deposit_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  depositAmount!: number;

  @ApiPropertyOptional({ description: 'Garantía adicional o aval', example: 1200.00 })
  @Column({ 
    name: 'additional_guarantee', 
    type: 'decimal', 
    precision: 12, 
    scale: 2, 
    default: 0,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  additionalGuarantee!: number;

  /* ─────────────────────────────────────────────────────────────────
   * ⚖️ FISCALIDAD
   * ───────────────────────────────────────────────────────────────── */

  @ManyToOne(() => Tax, { eager: true })
  @JoinColumn({ name: 'tax_iva_id' })
  @ApiProperty({ type: () => Tax, description: 'Impuesto indirecto aplicable (IVA/IGIC)' })
  taxIva!: Tax;

  @ManyToOne(() => Tax, { nullable: true, eager: true })
  @JoinColumn({ name: 'tax_irpf_id' })
  @ApiPropertyOptional({ type: () => Tax, description: 'Retención aplicable (IRPF)' })
  taxIrpf?: Tax;

  /* ─────────────────────────────────────────────────────────────────
   * ⚙️ CONFIGURACIÓN DE FACTURACIÓN
   * ───────────────────────────────────────────────────────────────── */

  @Column({
    type: 'enum',
    enum: PaymentFrequency,
    default: PaymentFrequency.MONTHLY,
    name: 'payment_frequency'
  })
  @ApiProperty({ enum: PaymentFrequency })
  paymentFrequency!: PaymentFrequency;

  @Column({ 
    type: 'enum', 
    enum: PaymentMethod, 
    default: PaymentMethod.TRANSFER,
    name: 'payment_method'
  })
  @ApiProperty({ enum: PaymentMethod })
  paymentMethod!: PaymentMethod;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.DRAFT,
    name: 'status'
  })
  @ApiProperty({ enum: ContractStatus })
  status!: ContractStatus;

  @Column({ name: 'billing_day', type: 'int', default: 1 })
  @ApiProperty({ description: 'Día del mes en que se genera la factura', example: 1 })
  billingDay!: number;

  /* ─────────────────────────────────────────────────────────────────
   * 📅 TEMPORALIDAD (RIGOR TEMPORAL)
   * ───────────────────────────────────────────────────────────────── */

  @Column({ name: 'start_date', type: 'date' })
  @ApiProperty({ example: '2026-01-01' })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'date' })
  @ApiProperty({ example: '2027-01-01' })
  endDate!: Date;

  @Column({ name: 'grace_period_days', type: 'int', default: 0 })
  @ApiProperty({ description: 'Días de carencia inicial' })
  gracePeriodDays!: number;

  @Column({ name: 'notice_period_days', type: 'int', default: 30 })
  @ApiProperty({ description: 'Días de preaviso para rescisión' })
  noticePeriodDays!: number;

  @Column({ name: 'actual_termination_date', type: 'date', nullable: true })
  @ApiPropertyOptional({ description: 'Fecha real de fin si hay rescisión anticipada' })
  actualTerminationDate?: Date;

  @Column({ name: 'next_billing_date', type: 'date', nullable: true })
  @ApiPropertyOptional({ description: 'Fecha de la próxima factura automática' })
  nextBillingDate?: Date;

  /* ─────────────────────────────────────────────────────────────────
   * 🔄 LÓGICA DE SINCRONIZACIÓN
   * ───────────────────────────────────────────────────────────────── */

  @BeforeInsert()
  @BeforeUpdate()
  syncMetadata(): void {
    if (this.startDate) this.startDate = new Date(this.startDate);
    if (this.endDate) this.endDate = new Date(this.endDate);
  }

  /**
   * @description Días restantes hasta el vencimiento del contrato.
   */
  @ApiProperty({ description: 'Días hasta el fin del contrato (campo calculado)' })
  get daysUntilExpiration(): number {
    if (!this.endDate) return 0;
    const diff = new Date(this.endDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}