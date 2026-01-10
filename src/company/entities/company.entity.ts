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
import { FacturaeParty } from 'src/facturae/entities/facturaeParty.entity';
import { Address } from 'src/address/entities/address.entity';
import { UserCompanyRole } from 'src/user-company-role/entities/userCompanyRole.entity';
import { User } from 'src/user/entities/user.entity';

@Entity('companies')
export class Company extends BaseEntity {

  /* ------------------------------------------------------------------
   * IDENTIDAD FISCAL
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'UUID de la identidad fiscal (FacturaeParty)',
    format: 'uuid',
    example: '9f8b4d1e-1a2b-4d9e-b9a2-123456789abc',
  })
  @Column({ name: 'facturae_party_id', type: 'uuid' })
  facturaePartyId: string;

  @ApiProperty({
    description: 'Entidad fiscal asociada a la empresa',
    type: () => FacturaeParty,
  })
  @OneToOne(() => FacturaeParty, { eager: true })
  @JoinColumn({ name: 'facturae_party_id' })
  facturaeParty: FacturaeParty;

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
    description: 'Dirección fiscal de la empresa',
    type: () => Address,
  })
  @OneToOne(() => Address, { nullable: true })
  @JoinColumn({ name: 'fiscal_address_id' })
  fiscalAddress?: Address;

  /* ------------------------------------------------------------------
   * AUDITORÍA
   * ------------------------------------------------------------------ */

  @ApiPropertyOptional({
    description: 'Usuario que creó la empresa (auditoría interna)',
    format: 'uuid',
    example: '7b5c9f0a-1111-2222-3333-abcdefabcdef',
  })
  @Column({
    name: 'created_by_user_id',
    type: 'uuid',
    nullable: true,
  })
  createdByUserId?: string;

  @ApiPropertyOptional({
    description: 'Usuario creador de la empresa (solo auditoría)',
    type: () => User,
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_user_id' })
  createdBy?: User;

  /* ------------------------------------------------------------------
   * ROLES POR EMPRESA
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Roles de usuarios dentro de la empresa',
    type: () => UserCompanyRole,
    isArray: true,
  })
  @OneToMany(
    () => UserCompanyRole,
    (ucr) => ucr.company,
  )
  companyRoles: UserCompanyRole[];
}
