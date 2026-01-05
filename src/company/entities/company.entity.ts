import {
  Entity,
  Column,
  OneToMany,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { BaseEntity } from 'src/common/base/base.entity';
import { FacturaeParty } from 'src/facturae/entities/facturae-party.entity';
import { Address } from 'src/address/entities/address.entity';
import { UserCompanyRole } from 'src/user-company-role/entities/user-company-role.entity';
import { User } from 'src/user/entities/user.entity';

@Entity('companies')
export class Company extends BaseEntity {

  /**
   * Identidad fiscal (Facturae)
   * --------------------------------
   * Representa la entidad legal/fiscal.
   * NO contiene permisos ni auditoría de la app.
   */
  @Column({ name: 'facturae_party_id', type: 'uuid' })
  facturaePartyId: string;

  @OneToOne(() => FacturaeParty, { eager: true })
  @JoinColumn({ name: 'facturae_party_id' })
  facturaeParty: FacturaeParty;

  /**
   * Dirección fiscal
   * --------------------------------
   * Nullable a propósito:
   * - evita ciclos Company ↔ Address
   * - permite flujos en varios pasos (frontend / seeder)
   * - la validación legal se hace en servicio, no en DB
   */
  @Column({
    name: 'fiscal_address_id',
    type: 'uuid',
    nullable: true,
  })
  fiscalAddressId?: string;

  @OneToOne(() => Address, { nullable: true })
  @JoinColumn({ name: 'fiscal_address_id' })
  fiscalAddress?: Address;

  /**
   * Auditoría: usuario que creó la empresa en el sistema
   * --------------------------------
   * ⚠️ NO define propiedad
   * ⚠️ NO implica permisos sobre la empresa
   * ⚠️ Normalmente será SUPERADMIN o ADMIN
   *
   * Su único propósito es:
   * - trazabilidad
   * - auditoría
   * - soporte / debugging
   */
  @Column({ name: 'created_by_user_id', type: 'uuid' })
  createdByUserId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by_user_id' })
  createdBy: User;

  /**
   * Roles de usuarios dentro de la empresa
   * --------------------------------
   * ÚNICA fuente de verdad para:
   * - OWNERS
   * - MANAGERS
   * - otros roles por empresa
   */
  @OneToMany(() => UserCompanyRole, (ucr) => ucr.company)
  companyRoles: UserCompanyRole[];
}
