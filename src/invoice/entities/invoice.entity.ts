import { Entity, Column, ManyToOne, OneToMany, Index, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Company } from '../../company/entities/company.entity';
import { TenantProfile } from '../../tenant-profile/entities/tenant-profile.entity';
import { Property } from '../../property/entities/property.entity';
import { Contract } from '../../contract/entities/contract.entity';
import { InvoiceItem } from './invoice-item.entity';
import { InvoiceStatus, InvoiceType } from '../enums';

/**
 * @entity Invoice
 * @description Entidad maestra de Facturación Rentix 2026.
 * Diseñada para cumplir con el Reglamento de facturación y Veri*factu.
 * Implementa aislamiento Multi-tenant y trazabilidad inmutable.
 */
@Entity('invoices')
@Index(['companyId', 'status'])
@Index(['companyId', 'invoiceNumber'])
export class Invoice extends BaseEntity {

  /* ─────────────────────────────────────────────────────────────────
   * 🏢 CONTEXTO Y AISLAMIENTO (MULTI-TENANT)
   * ───────────────────────────────────────────────────────────────── */

  /**
   * @column company_id
   * @description ID físico de la empresa. Fuente de verdad para el aislamiento.
   */
  @Column({ name: 'company_id', type: 'uuid' })
  @ApiProperty({ description: 'ID de la empresa emisora (Tenant)', example: '550e8400-e29b-41d4-a716-446655440000' })
  companyId!: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  @ApiProperty({ type: () => Company, description: 'Relación con la empresa propietaria' })
  company!: Company;

  /* ─────────────────────────────────────────────────────────────────
   * 📑 DATOS DE IDENTIFICACIÓN LEGAL (VERI*FACTU)
   * ───────────────────────────────────────────────────────────────── */

  @Column({ name: 'invoice_number', type: 'varchar', length: 50, nullable: true })
  @ApiPropertyOptional({ description: 'Número legal correlativo asignado tras emisión', example: '2026/0001' })
  invoiceNumber?: string;

  @Column({ type: 'enum', enum: InvoiceType, default: InvoiceType.ORDINARY })
  @ApiProperty({ enum: InvoiceType, description: 'Tipo de factura (F1 Ordinaria, R Rectificativa)' })
  type!: InvoiceType;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  @ApiProperty({ enum: InvoiceStatus, description: 'Estado: DRAFT (Borrador), EMITTED (Legal), CANCELLED (Anulada)' })
  status!: InvoiceStatus;

  @Column({ name: 'issue_date', type: 'date' })
  @ApiProperty({ description: 'Fecha de expedición del documento', example: '2026-01-25' })
  issueDate!: Date;

  @Column({ name: 'operation_date', type: 'date', nullable: true })
  @ApiPropertyOptional({ description: 'Fecha de devengo (si difiere de expedición)' })
  operationDate?: Date;

  /* ─────────────────────────────────────────────────────────────────
   * 👤 RELACIONES DE NEGOCIO (CLIENTE Y ACTIVO)
   * ───────────────────────────────────────────────────────────────── */

  @Column({ name: 'client_id', type: 'uuid' })
  @ApiProperty({ description: 'ID del perfil del cliente receptor' })
  clientId!: string;

  @ManyToOne(() => TenantProfile)
  @JoinColumn({ name: 'client_id' })
  @ApiProperty({ type: () => TenantProfile, description: 'Perfil fiscal del receptor' })
  client!: TenantProfile;

  @Column({ name: 'property_id', type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'ID de la propiedad vinculada' })
  propertyId?: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'property_id' })
  @ApiPropertyOptional({ type: () => Property })
  property?: Property;

  @Column({ name: 'contract_id', type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'ID del contrato de origen' })
  contractId?: string;

  @ManyToOne(() => Contract)
  @JoinColumn({ name: 'contract_id' })
  @ApiPropertyOptional({ type: () => Contract })
  contract?: Contract;

  /* ─────────────────────────────────────────────────────────────────
   * 💰 TOTALES (SANEADOS CON DECIMALES)
   * ───────────────────────────────────────────────────────────────── */

  @Column({ name: 'total_taxable_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Suma de bases imponibles' })
  totalTaxableAmount!: number;

  @Column({ name: 'total_tax_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Suma de cuotas de IVA' })
  totalTaxAmount!: number;

  @Column({ name: 'total_retention_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Suma de retenciones IRPF' })
  totalRetentionAmount!: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Importe Total Factura' })
  totalAmount!: number;

  /* ─────────────────────────────────────────────────────────────────
   * 🛡️ INTEGRIDAD VERI*FACTU
   * ───────────────────────────────────────────────────────────────── */

  @Column({ name: 'chain_hash', type: 'text', nullable: true })
  chainHash?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fingerprint?: string;

  @Column({ name: 'is_reported', type: 'boolean', default: false })
  isReported!: boolean;

  /* ─────────────────────────────────────────────────────────────────
   * 🔗 LÍNEAS DE DETALLE
   * ───────────────────────────────────────────────────────────────── */

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  @ApiProperty({ type: () => [InvoiceItem], description: 'Desglose detallado de conceptos' })
  items!: InvoiceItem[];
}