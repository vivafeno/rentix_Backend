import { Entity, Column, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/base/base.entity';
import { AppRole } from 'src/auth/enums/user-global-role.enum';
import { CompanyRoleEntity } from 'src/user-company-role/entities/userCompanyRole.entity';
import { TenantProfile } from 'src/tenant-profile/entities/tenant-profile.entity';

/**
 * @description Entidad fundamental de Usuario en Rentix.
 * Centraliza la identidad global (AppRole) y vincula las relaciones patrimoniales.
 * @version 2026.1.17
 */
@Entity('users')
export class User extends BaseEntity {
  /**
   * @description Correo electrónico único. Actúa como identificador de login.
   */
  @ApiProperty({
    description: 'Correo electrónico único del usuario',
    example: 'admin@rentix.com',
  })
  @Column({ unique: true })
  email: string;

  /**
   * @description Contraseña hasheada. Excluida de las consultas por defecto.
   */
  @ApiProperty({ description: 'Contraseña (Hashed)', writeOnly: true })
  @Column({ select: false })
  password: string;

  /* ------------------------------------------------------------------
   * DATOS PERSONALES
   * ------------------------------------------------------------------ */

  /**
   * @description Nombre del usuario. Capturado en el Step 1 del Wizard.
   */
  @ApiPropertyOptional({ description: 'Nombre', example: 'Carlos' })
  @Column({ name: 'first_name', nullable: true })
  firstName?: string;

  /**
   * @description Apellidos del usuario. Capturado en el Step 1 del Wizard.
   */
  @ApiPropertyOptional({ description: 'Apellidos', example: 'Sanz' })
  @Column({ name: 'last_name', nullable: true })
  lastName?: string;

  /**
   * @description Teléfono de contacto.
   */
  @ApiPropertyOptional({ description: 'Teléfono', example: '+34600112233' })
  @Column({ nullable: true })
  phone?: string;

  /**
   * @description URL de imagen de perfil almacenada en bucket.
   */
  @ApiPropertyOptional({ description: 'URL de la foto de perfil' })
  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  /* ------------------------------------------------------------------
   * SEGURIDAD Y ROLES GLOBALES
   * ------------------------------------------------------------------ */

  /**
   * @description Rol de sistema (SUPERADMIN, ADMIN, USER).
   * Determina el acceso a módulos globales de la aplicación.
   */
  @ApiProperty({
    description: 'Rol global del usuario (SUPERADMIN, ADMIN, USER)',
    enum: AppRole,
    default: AppRole.USER,
  })
  @Column({
    name: 'app_role',
    type: 'enum',
    enum: AppRole,
    default: AppRole.USER,
  })
  appRole: AppRole;

  /**
   * @description Flag de seguridad para verificación de cuenta.
   */
  @ApiProperty({ description: 'Estado de verificación del email' })
  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  /**
   * @description Hash del Refresh Token. Excluido de los JSON por seguridad.
   */
  @Column({
    name: 'refresh_token_hash',
    type: 'varchar',
    nullable: true,
    select: false,
  })
  refreshTokenHash?: string | null;

  /* ------------------------------------------------------------------
   * RELACIONES (Jerarquía de Patrimonio)
   * ------------------------------------------------------------------ */

  /**
   * @description Vínculos del usuario con empresas/patrimonios.
   * Blueprint 2026: Uso de cascade para permitir creación atómica en Wizard.
   */
  @ApiPropertyOptional({
    description:
      'Roles del usuario en diferentes patrimonios (OWNER, TENANT, VIEWER)',
    type: () => [CompanyRoleEntity],
  })
  @OneToMany(() => CompanyRoleEntity, (ucr) => ucr.user, { cascade: true })
  companyRoles: CompanyRoleEntity[];

  /**
   * @description Perfiles de arrendatario asociados.
   * Un usuario puede ser tenant en múltiples propiedades (mismo u otro Owner).
   */
  @ApiPropertyOptional({
    description: 'Detalles de perfil de arrendatario (datos fiscales, etc.)',
    type: () => [TenantProfile],
  })
  @OneToMany(() => TenantProfile, (tp) => tp.user, { cascade: true })
  tenantProfiles: TenantProfile[]; // Renombrado a tenantProfiles para consistencia con tu lógica de roles
}
