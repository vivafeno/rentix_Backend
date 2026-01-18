import { Entity, Column, ManyToOne, JoinColumn, Index, BeforeInsert, BeforeUpdate } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/base/base.entity';
import { Company } from 'src/company/entities/company.entity';
import { TenantProfile } from 'src/tenant-profile/entities/tenant-profile.entity';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { AddressType } from '../enums/addressType.enum';
import { AddressStatus } from '../enums/addressStatus.enum';

/**
 * @description Gestión de direcciones alineada con el estándar Veri*factu y FacturaE.
 * Se eliminan las líneas múltiples para cumplir con el esquema único de la AEAT.
 * @version 2026.2.0
 */
@Entity('addresses')
@Index(['companyId'])
@Index(['tenantId'])
@Index(['status'])
@Index(['type'])
@Index(['createdByUserId'])
@Index('IDX_ADDRESS_CITY_SEARCH', ['companyId', 'poblacion'])
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
   * DATOS POSTALES (VERI*FACTU / FACTURAE COMPLIANT)
   * ------------------------------------------------------------------ */

  @ApiProperty({ example: 'Calle de Alcalá 1, Piso 2º' })
  @Column({ name: 'direccion' })
  direccion: string;

  @ApiProperty({ example: '28014' })
  @Column({ name: 'codigo_postal', length: 16 })
  codigoPostal: string;

  @ApiProperty({ example: 'Madrid' })
  @Column({ name: 'poblacion' })
  poblacion: string;

  @ApiPropertyOptional({ example: 'Madrid' })
  @Column({ name: 'provincia', nullable: true })
  provincia?: string;

  /**
   * @description Código de país ISO 3166-1 alpha-3 (ESP).
   */
  @ApiProperty({ example: 'ESP', default: 'ESP' })
  @Column({ name: 'codigo_pais', length: 3, default: 'ESP' })
  codigoPais: string;

  /* ------------------------------------------------------------------
   * CICLO DE VIDA Y NORMALIZACIÓN
   * ------------------------------------------------------------------ */

  @BeforeInsert()
  @BeforeUpdate()
  normalizeData(): void {
    if (this.poblacion) this.poblacion = this.poblacion.trim();
    if (this.provincia) this.provincia = this.provincia.trim();
    if (this.codigoPostal) this.codigoPostal = this.codigoPostal.trim();
    if (this.direccion) this.direccion = this.direccion.trim();
    if (this.codigoPais) this.codigoPais = this.codigoPais.toUpperCase().trim();
  }
}