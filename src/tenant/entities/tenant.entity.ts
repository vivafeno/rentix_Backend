import { Entity, Column, ManyToOne, OneToMany, OneToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/base/base.entity';
import { Company } from 'src/company/entities/company.entity';
import { FiscalEntity } from 'src/fiscal/entities/fiscalEntity';
import { Address } from 'src/address/entities/address.entity';
import { TenantStatus } from '../enums/tenant-status.enum';

/**
 * Entidad Arrendatario (Tenant).
 * Gestiona la relación contractual y fiscal bajo el estándar Facturae 3.2.x.
 * Permite que una misma identidad fiscal pertenezca a diferentes empresas.
 * * @author Gemini Blueprint 2026
 * @inheritdoc BaseEntity
 */
@Entity('tenants')
@Index(['companyId', 'fiscalIdentityId'], { unique: true }) // 👈 Garantiza unicidad solo por ámbito de empresa
export class Tenant extends BaseEntity {

  // --------------------------------------------------------------------------
  // DATOS IDENTIFICATIVOS & ESTADO
  // --------------------------------------------------------------------------

  /** Código administrativo para uso interno del ERP */
  @ApiProperty({ example: 'TEN-2026-001', description: 'Referencia interna administrativa' })
  @Column({ name: 'internal_code', nullable: true })
  internalCode: string;

  /** Estado operativo del arrendatario */
  @ApiProperty({ enum: TenantStatus, example: TenantStatus.ACTIVE })
  @Column({ type: 'enum', enum: TenantStatus, default: TenantStatus.ACTIVE })
  status: TenantStatus;

  // --------------------------------------------------------------------------
  // DATOS DE CONTACTO
  // --------------------------------------------------------------------------

  /** Email para notificaciones legales y envío de facturas */
  @ApiProperty({ example: 'facturacion@arrendatario.es' })
  @Column({ nullable: true })
  email: string;

  /** Teléfono de contacto directo */
  @ApiProperty({ example: '+34 600000000' })
  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  // --------------------------------------------------------------------------
  // INFORMACIÓN FINANCIERA (FACTURAE COMPLIANT)
  // --------------------------------------------------------------------------

  /** Cuenta bancaria en formato IBAN para domiciliaciones (Remesas SEPA) */
  @ApiProperty({ example: 'ES210000...', description: 'IBAN para cobros automáticos' })
  @Column({ name: 'bank_account_iban', nullable: true })
  bankAccountIban: string;

  /** * Código de Residencia según Facturae: 
   * 1 = Residente en España, 2 = Residente UE, 3 = Extranjero 
   */
  @ApiProperty({ example: '1', description: 'Código de residencia fiscal (AEAT)' })
  @Column({ name: 'residency_code', default: '1', length: 1 })
  residencyCode: string;

  // --------------------------------------------------------------------------
  // RELACIONES Y AISLAMIENTO (MULTI-TENANCY)
  // --------------------------------------------------------------------------

  /** ID de la empresa propietaria del registro */
  @ApiProperty({ format: 'uuid' })
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  /** * Identidad Legal vinculada.
   * Explicitamos la columna ID para el índice compuesto y la vinculación por DTO.
   */
  @ApiProperty({ format: 'uuid' })
  @Column({ name: 'fiscal_identity_id', type: 'uuid' })
  fiscalIdentityId: string;

  @OneToOne(() => FiscalEntity, { cascade: false, eager: true }) // 👈 cascade false para evitar colisiones al vincular IDs existentes
  @JoinColumn({ name: 'fiscal_identity_id' })
  fiscalIdentity: FiscalEntity;

  /** * Colección de direcciones asociadas.
   * Imprescindible filtrar por AddressType.FISCAL para la generación de facturas.
   */
  @ApiProperty({ type: () => Address, isArray: true })
  @OneToMany(() => Address, (address) => address.tenant, { cascade: true, eager: true })
  addresses: Address[];
}