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

import { BaseEntity } from 'src/common/base/base.entity';
import { Company } from 'src/company/entities/company.entity';
import { Address } from 'src/address/entities/address.entity';
import { FiscalIdentity } from 'src/facturae/entities/fiscalIdentity.entity';
import { User } from 'src/user/entities/user.entity';

/**
 * 👤 ClientProfile
 *
 * Representa la ficha operativa de un cliente dentro de una empresa (Tenant).
 *
 * ARQUITECTURA:
 * - Datos Fiscales: Delegados en FiscalIdentity (Core Facturae).
 * - Datos CRM: Propios de esta entidad (Email, condiciones de pago, notas).
 * - Multi-tenant: Protegido por index único [companyId + internalCode].
 */
@Entity('client_profiles')
@Index(['companyId', 'internalCode'], { unique: true })
export class ClientProfile extends BaseEntity {

  /* ------------------------------------------------------------------
   * 🏢 TENANT (EMPRESA PROPIETARIA)
   * ------------------------------------------------------------------ */
  
  @ApiProperty({ type: () => Company })
  @ManyToOne(() => Company, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'company_id' })
  companyId: string;

  /* ------------------------------------------------------------------
   * ⚖️ IDENTIDAD FISCAL (CORE FACTURAE)
   * ------------------------------------------------------------------ */

  @ApiProperty({ description: 'Datos fiscales validados (NIF, Razón Social)' })
  @OneToOne(() => FiscalIdentity, { 
    cascade: true, 
    eager: true, // Carga automática para mostrar nombre en listados
    onDelete: 'CASCADE' 
  })
  @JoinColumn({ name: 'fiscal_identity_id' })
  fiscalIdentity: FiscalIdentity;

  /* ------------------------------------------------------------------
   * ⚙️ DATOS DE GESTIÓN (CRM)
   * ------------------------------------------------------------------ */

  @ApiProperty({ 
    description: 'Código interno único por empresa (ej: CLI-2024-001)',
    example: 'CLI-001'
  })
  @Column({ name: 'internal_code', length: 50 })
  internalCode: string;

  @ApiPropertyOptional({ description: 'Email principal para facturación electrónica' })
  @Column({ name: 'billing_email', nullable: true })
  billingEmail?: string;

  @ApiPropertyOptional({ description: 'Teléfono de contacto administrativo' })
  @Column({ nullable: true })
  phone?: string;

  /* ------------------------------------------------------------------
   * 💰 CONDICIONES DE PAGO (CRÍTICO FACTURAE)
   * ------------------------------------------------------------------ */

  @ApiPropertyOptional({ 
    description: 'Método de pago habitual (ej: TRANSFERENCIA, RECIBO, EFECTIVO)',
    example: 'TRANSFERENCIA'
  })
  @Column({ name: 'payment_method', nullable: true, default: 'TRANSFERENCIA' })
  paymentMethod?: string;

  @ApiProperty({ 
    description: 'Días de vencimiento para cálculo automático (0 = Contado)', 
    default: 0 
  })
  @Column({ name: 'payment_days', default: 0 })
  paymentDays: number;

  @ApiPropertyOptional({ description: 'Notas internas sobre el cliente (CRM)' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  /* ------------------------------------------------------------------
   * 🔐 ACCESO / PORTAL
   * ------------------------------------------------------------------ */

  @ApiPropertyOptional({ description: 'Usuario vinculado para acceso al portal de clientes' })
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  /* ------------------------------------------------------------------
   * 📍 DIRECCIONES
   * ------------------------------------------------------------------ */

  @OneToMany(() => Address, (address) => address.clientProfile, {
    cascade: ['insert', 'update'],
  })
  addresses: Address[];
}