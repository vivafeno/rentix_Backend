import {
  Entity,
  Column,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/base/base.entity';
import { UserGlobalRole } from 'src/auth/enums/user-global-role.enum';
import { UserCompanyRole } from 'src/user-company-role/entities/userCompanyRole.entity';
import { ClientProfile } from 'src/client-profile/entities/client-profile.entity';

/**
 * Entidad User
 *
 * Representa a un usuario del sistema Rentix.
 * Puede actuar como:
 * - Usuario interno (SUPERADMIN / ADMIN / USER)
 * - Usuario vinculado a una o varias empresas con roles específicos
 *
 * ⚠️ Aunque no se expone directamente como DTO,
 * se documenta correctamente para:
 * - Swagger / OpenAPI
 * - generación de api-types en frontend
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
    example: '$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @Column()
  password: string;

  @ApiPropertyOptional({
    description: 'Hash del refresh token activo',
    example: '$2b$10$yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  refreshTokenHash: string | null;

  /* ------------------------------------------------------------------
   * ROL GLOBAL
   * Controla permisos a nivel aplicación
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Rol global del usuario dentro del sistema',
    enum: UserGlobalRole,
    example: UserGlobalRole.USER,
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
  @OneToMany(
    () => UserCompanyRole,
    (ucr) => ucr.user,
  )
  companyRoles: UserCompanyRole[];

  /* ------------------------------------------------------------------
   * RELACIÓN CON CLIENTES
   * Usuarios que actúan como gestores de clientes
   * ------------------------------------------------------------------ */

  @ApiPropertyOptional({
    description: 'Perfiles de cliente asociados al usuario',
    type: () => ClientProfile,
    isArray: true,
  })
  @OneToMany(
    () => ClientProfile,
    (client) => client.user,
  )
  clientProfiles?: ClientProfile[];
}
