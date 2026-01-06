import {
  Entity,
  Column,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/base/base.entity';
import { UserGlobalRole } from 'src/auth/enums/user-global-role.enum';
import { UserCompanyRole } from 'src/user-company-role/entities/user-company-role.entity';
import { ClientProfile } from 'src/client-profile/entities/client-profile.entity';

/**
 * Entidad User
 *
 * Representa a un usuario del sistema Rentix.
 * Puede actuar como:
 * - Usuario interno (ADMIN / USER)
 * - Usuario asociado a empresas con distintos roles
 *
 * Aunque no se exponga directamente como DTO,
 * se documenta completamente para Swagger y mantenimiento.
 */
@Entity('users')
export class User extends BaseEntity {

  /* ------------------------------------------------------------------
   * CREDENCIALES
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Correo electrónico del usuario (único)',
    example: 'usuario@rentix.app',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    description: 'Hash de la contraseña del usuario',
    example: '$2b$10$...',
  })
  @Column()
  password: string;

  @ApiProperty({
    description: 'Hash del refresh token activo',
    nullable: true,
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  refreshTokenHash: string | null;

  /* ------------------------------------------------------------------
   * ROL GLOBAL
   * Controla permisos a nivel aplicación
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Rol global del usuario dentro del sistema',
    enum: UserGlobalRole,
    example: UserGlobalRole.USER,
    default: UserGlobalRole.USER,
  })
  @Column({
    type: 'enum',
    enum: UserGlobalRole,
    default: UserGlobalRole.USER,
  })
  userGlobalRole: UserGlobalRole;

  /* ------------------------------------------------------------------
   * RELACIÓN CON EMPRESAS
   * Un usuario puede tener múltiples roles en distintas empresas
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Roles del usuario en distintas empresas',
    type: () => UserCompanyRole,
    isArray: true,
  })
  @OneToMany(() => UserCompanyRole, (ucr) => ucr.user)
  companyRoles: UserCompanyRole[];

  /* ------------------------------------------------------------------
   * RELACIÓN CON CLIENTES
   * Opcional: usuarios que actúan como gestores de clientes
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Perfiles de cliente asociados al usuario',
    type: () => ClientProfile,
    isArray: true,
    required: false,
    nullable: true,
  })
  @OneToMany(() => ClientProfile, (client) => client.user, {
    nullable: true,
  })
  clientProfiles?: ClientProfile[];
}
