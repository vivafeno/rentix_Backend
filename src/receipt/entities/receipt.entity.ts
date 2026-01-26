import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity'; 
import { Company } from '../../company/entities/company.entity';
import { TenantProfile } from '../../tenant-profile/entities/tenant-profile.entity';

/**
 * @enum ReceiptType
 * @description Tipología legal del movimiento de caja.
 */
export enum ReceiptType {
  DEPOSIT = 'DEPOSIT', // Cobro de fianza/depósito
  REFUND = 'REFUND'    // Devolución o liquidación al inquilino
}

/**
 * @class Receipt
 * @description Representación física de un movimiento de tesorería no facturable (Fianzas).
 * Crucial para el cumplimiento normativo de depósitos legales.
 */
@Entity('receipts')
export class Receipt extends BaseEntity {

  @ApiProperty({ example: 'REC-123456', description: 'Número de serie único del recibo' })
  @Column({ type: 'varchar', length: 50, unique: true })
  number!: string;

  @ApiProperty({ enum: ReceiptType, default: ReceiptType.DEPOSIT })
  @Column({ type: 'enum', enum: ReceiptType, default: ReceiptType.DEPOSIT })
  type!: ReceiptType;

  @ApiProperty({ example: 1200.50, description: 'Importe atómico con 2 decimales' })
  @Column({ type: 'decimal', precision: 12, scale: 2, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value) // Evita que decimal llegue como string
  }})
  amount!: number;

  @ApiProperty({ example: 'Fianza correspondiente al contrato de arrendamiento A-101' })
  @Column({ type: 'text' })
  concept!: string;

  @ApiProperty({ description: 'Fecha efectiva del movimiento de caja' })
  @Column({ name: 'issue_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  issueDate!: Date;

  // --- Contexto Multi-tenant ---
  
  @Column({ name: 'active_company_id' })
  activeCompanyId!: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'active_company_id' })
  company!: Company;

  // --- Relación con Perfil de Cliente (CRM) ---

  @ApiPropertyOptional({ description: 'ID del perfil legal del cliente' })
  @Column({ name: 'tenant_id', nullable: true })
  tenantId?: string;

  @ManyToOne(() => TenantProfile, { nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant?: TenantProfile; // 🚩 Corregido: Apunta al perfil legal (CRM)

  @ApiPropertyOptional({ example: 'Juan Pérez (Sin perfil)', description: 'Nombre manual si no existe en el CRM' })
  @Column({ name: 'manual_tenant_name', nullable: true })
  manualTenantName?: string;
}