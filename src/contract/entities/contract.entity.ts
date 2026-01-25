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
import { BaseEntity } from 'src/common/entities/base.entity';
import { Company } from 'src/company/entities/company.entity';
import { Property } from 'src/property/entities/property.entity';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { Tax } from 'src/tax/entities/tax.entity';
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

  /* --- CONTEXTO Y SEGURIDAD (Multi-tenancy) --- */

  @Index()
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  /* --- VÍNCULOS OPERATIVOS --- */

  @Column({ name: 'property_id', type: 'uuid' })
  propertyId: string;

  @ManyToOne(() => Property, { eager: false })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ManyToMany(() => Tenant, (tenant) => tenant.contracts, { eager: true })
  @JoinTable({
    name: 'contract_tenants',
    joinColumn: { name: 'contract_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tenant_id', referencedColumnName: 'id' },
  })
  tenants: Tenant[];

  /* --- ECONOMÍA (Rigor Financiero) --- */

  @ApiProperty({ example: 1200.00 })
  @Column({
    name: 'base_rent',
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  baseRent: number;

  @ApiProperty({ example: 2400.00 })
  @Column({
    name: 'deposit_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  depositAmount: number;

  @Column({ 
    name: 'additional_guarantee', 
    type: 'decimal', 
    precision: 12, 
    scale: 2, 
    default: 0,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  additionalGuarantee: number;

  /* --- FISCALIDAD --- */

  @ManyToOne(() => Tax, { eager: true })
  @JoinColumn({ name: 'tax_iva_id' })
  taxIva: Tax;

  @ManyToOne(() => Tax, { nullable: true, eager: true })
  @JoinColumn({ name: 'tax_irpf_id' })
  taxIrpf: Tax;

  /* --- CONFIGURACIÓN DE FACTURACIÓN --- */

  @Column({
    type: 'enum',
    enum: PaymentFrequency,
    default: PaymentFrequency.MONTHLY,
    name: 'payment_frequency'
  })
  paymentFrequency: PaymentFrequency;

  @Column({ 
    type: 'enum', 
    enum: PaymentMethod, 
    default: PaymentMethod.TRANSFER,
    name: 'payment_method'
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.DRAFT,
    name: 'status'
  })
  status: ContractStatus;

  @Column({ name: 'billing_day', type: 'int', default: 1 })
  billingDay: number;

  /* --- TEMPORALIDAD (Rigor Temporal) --- */

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'grace_period_days', type: 'int', default: 0 })
  gracePeriodDays: number;

  @Column({ name: 'notice_period_days', type: 'int', default: 30 })
  noticePeriodDays: number;

  @Column({ name: 'actual_termination_date', type: 'date', nullable: true })
  actualTerminationDate?: Date;

  @Column({ name: 'next_billing_date', type: 'date', nullable: true })
  nextBillingDate: Date;

  /* --- LOGICA DE SINCRONIZACIÓN --- */

  @BeforeInsert()
  @BeforeUpdate()
  syncMetadata(): void {
    if (this.startDate) this.startDate = new Date(this.startDate);
    if (this.endDate) this.endDate = new Date(this.endDate);
    
    // El cálculo de nextBillingDate se delega al Service para mayor control
    // sobre los periodos de carencia y prorrateos iniciales.
  }

  /**
   * @description Helper para la UI de Angular: Días hasta el vencimiento.
   */
  get daysUntilExpiration(): number {
    if (!this.endDate) return 0;
    const diff = new Date(this.endDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}