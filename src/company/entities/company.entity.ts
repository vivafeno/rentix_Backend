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
import { FiscalIdentity } from 'src/facturae/entities/fiscalIdentity.entity';
import { Address } from 'src/address/entities/address.entity';
import { User } from 'src/user/entities/user.entity';
import { CompanyRoleEntity } from 'src/user-company-role/entities/userCompanyRole.entity';
import { ClientProfile } from 'src/client-profile/entities/client-profile.entity';
import { Property } from 'src/property/entities/property.entity';

@Entity('companies')
export class Company extends BaseEntity {

  /* ------------------------------------------------------------------
   * IDENTIDAD FISCAL (CIF, Razón Social)
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'UUID de la identidad fiscal (Referencia a FacturaeParty)',
    format: 'uuid',
    example: '9f8b4d1e-1a2b-4d9e-b9a2-123456789abc',
  })
  @Column({ name: 'facturae_party_id', type: 'uuid' })
  facturaePartyId: string;

  @ApiProperty({
    description: 'Objeto completo de la identidad fiscal (Razón social, CIF...)',
    type: () => FiscalIdentity,
  })
  @OneToOne(() => FiscalIdentity, { 
    eager: true,                 // ⚡ Se carga siempre automáticamente
    cascade: ['insert', 'update'], // 🚨 CRÍTICO: Permite crear/editar la identidad desde el endpoint de Company
    onDelete: 'RESTRICT'         // No borrar la identidad si se borra la empresa (o CASCADE según tu lógica de negocio)
  })
  @JoinColumn({ name: 'facturae_party_id' })
  facturaeParty: FiscalIdentity;

  /* ------------------------------------------------------------------
   * DIRECCIÓN FISCAL
   * ------------------------------------------------------------------ */

  @ApiPropertyOptional({
    description: 'UUID de la dirección fiscal asociada',
    format: 'uuid',
    example: '1a2b3c4d-aaaa-bbbb-cccc-123456789abc',
  })
  @Column({
    name: 'fiscal_address_id',
    type: 'uuid',
    nullable: true,
  })
  fiscalAddressId?: string;

  @ApiPropertyOptional({
    description: 'Objeto completo de la dirección fiscal',
    type: () => Address,
  })
  @OneToOne(() => Address, { 
    nullable: true,
    eager: true,                 // ⚡ Recomendado: Al cargar empresa, solemos querer la dirección
    cascade: ['insert', 'update']  // 🚨 CRÍTICO: Permite editar la dirección desde el endpoint de Company
  })
  @JoinColumn({ name: 'fiscal_address_id' })
  fiscalAddress?: Address;

  /* ------------------------------------------------------------------
   * AUDITORÍA (Creador)
   * ------------------------------------------------------------------ */

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

  @ApiPropertyOptional({
    description: 'Entidad del usuario creador (No se carga por defecto)',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_user_id' })
  createdBy?: User;

  /* ------------------------------------------------------------------
   * RELACIONES 1:N (Roles, Propiedades, Clientes)
   * Nota: Estas relaciones suelen ser Lazy (eager: false) por rendimiento
   * ------------------------------------------------------------------ */

  @ApiPropertyOptional({
    description: 'Lista de usuarios y sus roles en esta empresa',
    type: () => [CompanyRoleEntity],
  })
  @OneToMany(() => CompanyRoleEntity, (ucr) => ucr.company)
  companyRoles: CompanyRoleEntity[];

  @ApiPropertyOptional({ 
    description: 'Inventario de propiedades (inmuebles) de la empresa',
    type: () => [Property]
  })
  @OneToMany(() => Property, (property) => property.company, {
    eager: false, // ⚡ Performance: No cargar cientos de propiedades en el login
  })
  properties: Property[];

  @ApiPropertyOptional({
    description: 'Cartera de clientes (CRM) asociados a la empresa',
    type: () => [ClientProfile],
  })
  @OneToMany(() => ClientProfile, (client) => client.company, {
    eager: false, // ⚡ Performance
  })
  clientProfiles: ClientProfile[];
}