import {
  Entity,
  Column,
  OneToMany,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/base/base.entity';
import { FiscalEntity } from 'src/fiscal/entities/fiscalEntity';
import { Address } from 'src/address/entities/address.entity';
import { User } from 'src/user/entities/user.entity';
import { CompanyRoleEntity } from 'src/user-company-role/entities/userCompanyRole.entity';
import { TenantProfile } from 'src/tenant-profile/entities/tenant-profile.entity';
import { Property } from 'src/property/entities/property.entity';

/**
 * @description Entidad que representa el Patrimonio (Empresa) del OWNER.
 * Centraliza la identidad fiscal, dirección y la propiedad de activos (inmuebles).
 * @version 2026.1.17
 */
@Entity('companies')
export class Company extends BaseEntity {

  /* ------------------------------------------------------------------
   * IDENTIDAD FISCAL (CIF, Razón Social)
   * ------------------------------------------------------------------ */

  /**
   * @description UUID de referencia a la identidad fiscal (Facturae).
   */
  @ApiProperty({
    description: 'UUID de la identidad fiscal (Referencia a FacturaeParty)',
    format: 'uuid',
    example: '9f8b4d1e-1a2b-4d9e-b9a2-123456789abc',
  })
  @Column({ name: 'facturae_party_id', type: 'uuid' })
  facturaePartyId: string;

  /**
   * @description Relación con los datos fiscales. Blueprint: Cascade permite crear
   * la identidad fiscal simultáneamente al crear la compañía.
   */
  @ApiProperty({
    description: 'Objeto completo de la identidad fiscal (Razón social, CIF...)',
    type: () => FiscalEntity,
  })
  @OneToOne(() => FiscalEntity, { 
    eager: true,
    cascade: ['insert', 'update'],
    onDelete: 'RESTRICT' // Seguridad: No permitimos borrar datos fiscales si hay empresa activa
  })
  @JoinColumn({ name: 'facturae_party_id' })
  facturaeParty: FiscalEntity;

  /* ------------------------------------------------------------------
   * DIRECCIÓN FISCAL
   * ------------------------------------------------------------------ */

  /**
   * @description UUID de la dirección física/fiscal.
   */
  @ApiPropertyOptional({
    description: 'UUID de la dirección fiscal asociada',
    format: 'uuid',
  })
  @Column({
    name: 'fiscal_address_id',
    type: 'uuid',
    nullable: true,
  })
  fiscalAddressId?: string;

  /**
   * @description Relación con la dirección física.
   */
  @ApiPropertyOptional({
    description: 'Objeto completo de la dirección fiscal',
    type: () => Address,
  })
  @OneToOne(() => Address, { 
    nullable: true,
    eager: true,
    cascade: ['insert', 'update']
  })
  @JoinColumn({ name: 'fiscal_address_id' })
  fiscalAddress?: Address;

  /* ------------------------------------------------------------------
   * AUDITORÍA (Creador)
   * ------------------------------------------------------------------ */

  /**
   * @description ID del OWNER que dio de alta el patrimonio.
   */
  @ApiPropertyOptional({
    description: 'ID del usuario que creó el registro (Auditoría)',
    format: 'uuid',
  })
  @Column({
    name: 'created_by_user_id',
    type: 'uuid',
    nullable: true,
  })
  createdByUserId?: string;

  /**
   * @description Entidad del creador. No se carga por defecto para evitar ciclos.
   */
  @ApiPropertyOptional({
    description: 'Entidad del usuario creador',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_user_id' })
  createdBy?: User;

  /* ------------------------------------------------------------------
   * RELACIONES 1:N (Roles, Propiedades, Clientes)
   * ------------------------------------------------------------------ */

  /**
   * @description Vínculos de autoridad (OWNER, TENANT, VIEWER).
   */
  @ApiPropertyOptional({
    description: 'Lista de usuarios y sus roles en esta empresa',
    type: () => [CompanyRoleEntity],
  })
  @OneToMany(() => CompanyRoleEntity, (ucr) => ucr.company)
  companyRoles: CompanyRoleEntity[];

  /**
   * @description Lista de inmuebles vinculados a este patrimonio.
   */
  @ApiPropertyOptional({ 
    description: 'Inventario de propiedades (inmuebles) de la empresa',
    type: () => [Property]
  })
  @OneToMany(() => Property, (property) => property.company, {
    eager: false,
  })
  properties: Property[];

  /**
   * @description Perfiles de arrendatarios registrados por el OWNER.
   * Blueprint 2026: Consistencia con el término TENANT.
   */
  @ApiPropertyOptional({
    description: 'Cartera de arrendatarios asociados al patrimonio',
    type: () => [TenantProfile],
  })
  @OneToMany(() => TenantProfile, (tenant) => tenant.company, {
    eager: false,
  })
  tenantProfiles: TenantProfile[]; // Renombrado de clientProfiles a tenantProfiles
}