import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { BaseEntity } from 'src/common/base/base.entity';
import { User } from 'src/user/entities/user.entity';
import { Company } from 'src/company/entities/company.entity';
import { Address } from 'src/address/entities/address.entity';

/**
 * 👤 ClientProfile
 *
 * Representa un cliente de una empresa:
 * - Puede ser una persona física o jurídica
 * - Pertenece SIEMPRE a una empresa
 * - Puede estar vinculado opcionalmente a un usuario (portal cliente futuro)
 * - Puede tener múltiples direcciones (fiscal, envío, postal, etc.)
 */
@Entity('client_profiles')
export class ClientProfile extends BaseEntity {

  /**
   * Nombre comercial o razón social del cliente
   */
  @Column()
  name: string;

  /**
   * NIF / CIF del cliente
   * ⚠️ NO es único globalmente, solo dentro de una empresa
   */
  @Column()
  nif: string;

  /**
   * Email de contacto del cliente (opcional)
   */
  @Column({ nullable: true })
  email?: string;

  /**
   * Teléfono de contacto (opcional)
   */
  @Column({ nullable: true })
  phone?: string;

  /**
   * 🏢 Empresa propietaria del cliente
   * - Un cliente SIEMPRE pertenece a una empresa
   * - Si se borra la empresa → se borran sus clientes
   */
  @ManyToOne(() => Company, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  company: Company;

  /**
   * 👤 Usuario vinculado (opcional)
   * - Útil para portales de cliente / acceso externo
   * - Si se borra el usuario → se elimina el vínculo
   */
  @ManyToOne(() => User, (user) => user.clientProfiles, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  user?: User;

  /**
   * 📍 Direcciones del cliente
   * - Fiscal
   * - Envío
   * - Postal
   * - Etc.
   *
   * cascade:
   * - insert → se crean junto al cliente
   * - update → se actualizan automáticamente
   *
   * ❌ NO cascade delete: el borrado se controla vía isActive
   */
  @OneToMany(
    () => Address,
    (address) => address.clientProfile,
    {
      cascade: ['insert', 'update'],
    },
  )
  addresses: Address[];
}
