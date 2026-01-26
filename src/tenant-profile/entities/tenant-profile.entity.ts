import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/entities/base.entity';
import { Company } from 'src/company/entities/company.entity';
import { Address } from 'src/address/entities/address.entity';
import { FiscalEntity } from 'src/fiscal/entities/fiscal.entity';
import { User } from 'src/user/entities/user.entity';
import { Contract } from 'src/contract/entities/contract.entity';
import { Tenant } from './../../tenant/entities/tenant.entity';

/**
 * 👤 TenantProfile
 * Versión Gema Rentix 2026: Orquestador Operativo y Fiscal.
 */
@Entity('tenant_profiles')
@Index(['companyId', 'internalCode'], { unique: true })
export class TenantProfile extends BaseEntity {

  /* --- EMPRESA PROPIETARIA (Aislamiento Multi-tenant) --- */
  @ManyToOne(() => Company, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company!: Company;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  /* --- VÍNCULO CON LA IDENTIDAD (Core) --- */
  @OneToOne(() => Tenant, (tenant) => tenant.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  /* --- IDENTIDAD FISCAL (Veri*factu Ready) --- */
  @ApiProperty({ description: 'Datos fiscales validados (NIF, Razón Social)' })
  @OneToOne(() => FiscalEntity, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fiscal_identity_id' })
  fiscalIdentity!: FiscalEntity;

  @Column({ name: 'fiscal_identity_id', type: 'uuid', nullable: true })
  fiscalIdentityId!: string;

  /* --- DATOS DE GESTIÓN CRM --- */
  @ApiProperty({ example: 'CLI-001' })
  @Column({ name: 'internal_code', length: 50, nullable: true })
  internalCode!: string;

  @ApiPropertyOptional({ example: 'facturacion@arrendatario.es' })
  @Column({ name: 'billing_email', nullable: true })
  billingEmail?: string;

  @ApiPropertyOptional({ example: '+34 600 000 000' })
  @Column({ name: 'phone', nullable: true })
  phone?: string;

  /* --- CONDICIONES DE PAGO & SEPA --- */
  @ApiPropertyOptional({ example: 'ES210000...' })
  @Column({ name: 'bank_iban', nullable: true, length: 34 })
  bankIban?: string;

  @ApiPropertyOptional({ example: 'TRANSFERENCIA' })
  @Column({ name: 'payment_method', nullable: true, default: 'TRANSFERENCIA' })
  paymentMethod?: string;

  @ApiProperty({ description: 'Días de vencimiento', default: 0 })
  @Column({ name: 'payment_days', type: 'int', default: 0 })
  paymentDays!: number;

  @ApiPropertyOptional({ description: 'Código residencia (1=ES, 2=UE, 3=EXT)' })
  @Column({ name: 'tax_residence_code', length: 1, default: '1' })
  taxResidenceCode!: string;

  /* --- VÍNCULO CON EL PORTAL --- */
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  /* --- RELACIONES INVERSAS (Navegabilidad) --- */

  @ApiProperty({ type: () => Address, isArray: true })
  @OneToMany(() => Address, (address) => address.tenant, {
    cascade: true,
  })
  addresses!: Address[];

  @OneToMany(() => Contract, (contract) => contract.tenants)
  contracts!: Contract[];
}