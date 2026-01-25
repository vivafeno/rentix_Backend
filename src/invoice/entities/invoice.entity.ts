import { Entity, Column, ManyToOne, OneToMany, Index, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Company } from '../../company/entities/company.entity';
import { TenantProfile } from '../../tenant-profile/entities/tenant-profile.entity';
import { Property } from '../../property/entities/property.entity';
import { Contract } from '../../contract/entities/contract.entity';
import { InvoiceItem } from './invoice-item.entity';

/**
 * @description Tipos de factura según normativa AEAT / Veri*factu 2026.
 */
export enum InvoiceType {
  ORDINARY = 'F1',       // Factura completa
  SIMPLIFIED = 'F2',     // Factura simplificada (Ticket)
  RECTIFICATIVE = 'R1',  // Factura rectificativa (Errores, devoluciones)
}

/**
 * @description Estados del ciclo de vida de una factura en Rentix 2026.
 */
export enum InvoiceStatus {
  DRAFT = 'DRAFT',       // Borrador (Editable, sin número legal)
  EMITTED = 'EMITTED',   // Emitida (Inmutable, con número legal y hash)
  CANCELLED = 'CANCELLED'// Anulada (Vía factura rectificativa)
}

/**
 * @description Entidad principal de Facturación. 
 * Implementa el rigor de inmutabilidad y encadenamiento de Veri*factu.
 */
@Entity('invoices')
@Index(['companyId', 'status'])
@Index(['companyId', 'invoiceNumber']) // Rapidez en búsquedas de numeración legal
export class Invoice extends BaseEntity {

  /* ─────────────────────────────────────────────────────────────────
   * 🏢 CONTEXTO Y AISLAMIENTO (MULTI-TENANT)
   * ───────────────────────────────────────────────────────────────── */

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'ID de la empresa emisora' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  /* ─────────────────────────────────────────────────────────────────
   * 📑 DATOS DE IDENTIFICACIÓN LEGAL
   * ───────────────────────────────────────────────────────────────── */

  @Column({ type: 'varchar', length: 50, nullable: true })
  @ApiPropertyOptional({ description: 'Número de factura legal (Ej: 2026/0001)', example: '2026/0001' })
  invoiceNumber: string;

  @Column({ type: 'enum', enum: InvoiceType, default: InvoiceType.ORDINARY })
  @ApiProperty({ enum: InvoiceType, description: 'Tipo de factura según AEAT' })
  type: InvoiceType;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  @ApiProperty({ enum: InvoiceStatus, description: 'Estado actual de la factura' })
  status: InvoiceStatus;

  @Column({ type: 'date' })
  @ApiProperty({ description: 'Fecha de expedición (Seleccionada por usuario)', example: '2026-01-15' })
  issueDate: Date;

  @Column({ type: 'date', nullable: true })
  @ApiPropertyOptional({ description: 'Fecha de operación si difiere de la de expedición' })
  operationDate: Date;

  /* ─────────────────────────────────────────────────────────────────
   * 👤 RELACIONES DE NEGOCIO (RECEPTOR Y ACTIVO)
   * ───────────────────────────────────────────────────────────────── */

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'ID del cliente receptor' })
  clientId: string;

  @ManyToOne(() => TenantProfile)
  @JoinColumn({ name: 'clientId' })
  client: TenantProfile;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'ID de la propiedad vinculada' })
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'ID del contrato origen' })
  contractId: string;

  @ManyToOne(() => Contract)
  @JoinColumn({ name: 'contractId' })
  contract: Contract;

  /* ─────────────────────────────────────────────────────────────────
   * 💰 TOTALES (RESUMEN DE LÍNEAS)
   * ───────────────────────────────────────────────────────────────── */

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Suma de bases imponibles tras descuentos' })
  totalTaxableAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Total cuotas de IVA' })
  totalTaxAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Total retenciones aplicadas' })
  totalRetentionAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Importe total neto a pagar' })
  totalAmount: number;

  /* ─────────────────────────────────────────────────────────────────
   * 🛡️ VERI*FACTU / INTEGRIDAD
   * ───────────────────────────────────────────────────────────────── */

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Hash encadenado con la factura anterior' })
  chainHash: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @ApiPropertyOptional({ description: 'Firma digital / Huella del registro' })
  fingerprint: string;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ description: 'Indica si ha sido enviada a la AEAT' })
  isReported: boolean;

  /* ─────────────────────────────────────────────────────────────────
   * 🔗 LÍNEAS DE DETALLE
   * ───────────────────────────────────────────────────────────────── */

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  @ApiProperty({ type: () => [InvoiceItem], description: 'Líneas de detalle de la factura' })
  items: InvoiceItem[];
}