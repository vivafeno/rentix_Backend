import { Entity, Column, ManyToOne, JoinColumn, Index, BeforeInsert, BeforeUpdate } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/base/base.entity';
import { Company } from 'src/company/entities/company.entity';
import { TenantProfile } from 'src/tenant-profile/entities/tenant-profile.entity';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { AddressType } from '../enums/addressType.enum';
import { AddressStatus } from '../enums/addressStatus.enum';

/**
 * @description Gestión centralizada de direcciones postales y fiscales.
 * Cumple con el estándar ISO 3166-1 alpha-3 para compatibilidad con FacturaE.
 * @version 2026.1.17
 */
@Entity('addresses')
@Index(['companyId'])
@Index(['tenantId'])
@Index(['status'])
@Index(['type'])
@Index(['createdByUserId'])
@Index('IDX_ADDRESS_CITY_SEARCH', ['companyId', 'city'])
export class Address extends BaseEntity {

  /* ------------------------------------------------------------------
   * RELACIONES Y CONTEXTO
   * ------------------------------------------------------------------ */

  @ApiPropertyOptional({ description: 'ID de la empresa (Tenant Isolation)' })
  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId?: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @ApiPropertyOptional({ description: 'ID del Arrendatario asociado' })
  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId?: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.addresses, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant?: Tenant;

  @ApiPropertyOptional({ description: 'ID del perfil de cliente' })
  @Column({ name: 'client_profile_id', type: 'uuid', nullable: true })
  clientProfileId?: string;

  @ManyToOne(() => TenantProfile, (cp) => cp.addresses, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_profile_id' })
  clientProfile?: TenantProfile;

  @ApiPropertyOptional({ description: 'Usuario que registró la dirección' })
  @Column({ name: 'created_by_user_id', type: 'uuid', nullable: true })
  createdByUserId?: string;

  /* ------------------------------------------------------------------
   * ATRIBUTOS DE ESTADO Y TIPO
   * ------------------------------------------------------------------ */

  @ApiProperty({ enum: AddressStatus })
  @Column({ type: 'enum', enum: AddressStatus, default: AddressStatus.DRAFT })
  status: AddressStatus;

  @ApiProperty({ enum: AddressType, description: 'FISCAL, NOTIFICACION, PROPIEDAD, etc.' })
  @Column({ type: 'enum', enum: AddressType })
  type: AddressType;

  @ApiProperty({ default: false })
  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  /* ------------------------------------------------------------------
   * DATOS POSTALES (FACTURAE COMPLIANT)
   * ------------------------------------------------------------------ */

  @ApiProperty({ example: 'Calle de Alcalá 1' })
  @Column({ name: 'address_line1' })
  addressLine1: string;

  @ApiPropertyOptional({ example: 'Piso 2º Derecha' })
  @Column({ name: 'address_line2', nullable: true })
  addressLine2?: string;

  @ApiProperty({ example: '28014' })
  @Column({ name: 'postal_code', length: 16 })
  postalCode: string;

  @ApiProperty({ example: 'Madrid' })
  @Column()
  city: string;

  @ApiPropertyOptional({ example: 'Madrid' })
  @Column({ nullable: true })
  province?: string;

  /**
   * @description Código de país. Cambiado a length: 3 para cumplir con ISO 3166-1 alpha-3 (ESP).
   */
  @ApiProperty({ example: 'ESP', default: 'ESP' })
  @Column({ name: 'country_code', length: 3, default: 'ESP' })
  countryCode: string;

  /* ------------------------------------------------------------------
   * CICLO DE VIDA Y NORMALIZACIÓN
   * ------------------------------------------------------------------ */

  @BeforeInsert()
  @BeforeUpdate()
  normalizeData(): void {
    if (this.city) this.city = this.city.trim();
    if (this.province) this.province = this.province.trim();
    if (this.postalCode) this.postalCode = this.postalCode.trim();
    if (this.addressLine1) this.addressLine1 = this.addressLine1.trim();
    if (this.countryCode) this.countryCode = this.countryCode.toUpperCase().trim();
  }
}