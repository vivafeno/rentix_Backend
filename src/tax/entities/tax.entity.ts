import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Company } from '../../company/entities/company.entity';
import { TaxType } from '../enums/tax-type.enum';

/**
 * @class Tax
 * @description Hardened tax configuration for the invoicing engine.
 * Complies with Verifactu (AEAT) requirements for VAT/Withholding breakdown.
 * All properties normalized to English for Frontend Signal-Store consistency.
 * @version 2026.2.1
 */
@Entity('taxes')
export class Tax extends BaseEntity {
  /* --- PATRIMONIAL CONTEXT --- */

  @ApiProperty({ description: 'Issuing company UUID' })
  @Index()
  @Column({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company!: Company;

  /* --- FISCAL DEFINITION (Verifactu) --- */

  @ApiProperty({
    example: 'Exempt VAT - Residential Rental',
    description: 'Descriptive name for the tax item',
  })
  @Column({ name: 'name', length: 100 }) // ✅ Fixed: nombre -> name
  name!: string;

  @ApiProperty({
    enum: TaxType,
    description: 'Tax category (VAT, Withholding, IGIC, IPSI)',
  })
  @Column({ 
    name: 'type', // ✅ Fixed: tipo -> type
    type: 'enum', 
    enum: TaxType, 
    default: TaxType.IVA 
  })
  type!: TaxType;

  @ApiProperty({ example: 21.0, description: 'Applied tax rate percentage' })
  @Column({
    name: 'percentage', // ✅ Fixed: porcentaje -> percentage
    type: 'decimal',
    precision: 5,
    scale: 2,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  percentage!: number;

  @ApiProperty({
    description: 'If true, it subtracts from the invoice total (Withholding/Retención)',
  })
  @Column({ name: 'is_retention', type: 'boolean', default: false }) // ✅ Fixed: es_retencion -> is_retention
  isRetention!: boolean;

  /* --- VERI*FACTU CRITICAL ATTRIBUTES --- */

  /**
   * @description Exemption Cause (Art. 20 LIVA).
   * Mandatory for 0% rates (e.g., E1 for residential rentals).
   */
  @ApiProperty({
    example: 'E1',
    description: 'AEAT Code: E1 (Residential), E2 (Education), etc.',
  })
  @Column({ name: 'exemption_cause', length: 5, nullable: true }) // ✅ Fixed: causa_exencion -> exemption_cause
  exemptionCause?: string;

  /**
   * @description Tax type for FacturaE and SII schemes.
   * '01' = VAT, '02' = Income Tax (IRPF), '03' = IGIC.
   */
  @ApiProperty({ example: '01', description: 'Official FacturaE code' })
  @Column({ name: 'factura_e_code', length: 10, default: '01' }) // ✅ Fixed: codigo_facturae -> factura_e_code
  facturaECode!: string;

  /**
   * @description Indicates if this tax is the default configuration for the company.
   */
  @Column({ name: 'is_default', default: false }) // ✅ Fixed: es_predeterminado -> is_default
  isDefault!: boolean;
}