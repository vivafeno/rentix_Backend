import { Entity, Column, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/base/base.entity';
import { AppRole } from 'src/auth/enums/user-global-role.enum';
import { CompanyRoleEntity } from 'src/user-company-role/entities/userCompanyRole.entity';
import { ClientProfile } from 'src/client-profile/entities/client-profile.entity';

@Entity('users')
export class User extends BaseEntity {

  @ApiProperty({
    description: 'Correo electrónico único del usuario',
    example: 'admin@rentix.com',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'Contraseña (Hashed)', writeOnly: true })
  @Column({ select: false }) // No se devuelve en los GET por seguridad
  password: string;

  /* ------------------------------------------------------------------
   * DATOS PERSONALES (Sincronizados con el Setup Wizard)
   * ------------------------------------------------------------------ */

  @ApiPropertyOptional({ description: 'Nombre', example: 'Carlos' })
  @Column({ name: 'first_name', nullable: true })
  firstName?: string;

  @ApiPropertyOptional({ description: 'Apellidos', example: 'Sanz' })
  @Column({ name: 'last_name', nullable: true })
  lastName?: string;

  @ApiPropertyOptional({ description: 'Teléfono', example: '+34600112233' })
  @Column({ nullable: true })
  phone?: string;

  @ApiPropertyOptional({ description: 'URL de la foto de perfil' })
  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  /* ------------------------------------------------------------------
   * ROL GLOBAL (Aplicación)
   * ------------------------------------------------------------------ */

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

  @ApiProperty({ description: 'Estado de verificación del email' })
  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({
    name: 'refresh_token_hash',
    type: 'varchar',
    nullable: true,
    select: false, // 👈 Seguridad: evita que el hash viaje en los JSON
  })
  refreshTokenHash?: string | null;

  /* ------------------------------------------------------------------
   * RELACIONES (Jerarquía de Empresa)
   * ------------------------------------------------------------------ */

  @ApiPropertyOptional({
    description: 'Roles del usuario en diferentes empresas (OWNER, CLIENT, etc.)',
    // 👇 FIX CRÍTICO: Función flecha + Array para evitar ciclo infinito
    type: () => [CompanyRoleEntity], 
  })
  @OneToMany(() => CompanyRoleEntity, (ucr) => ucr.user)
  companyRoles: CompanyRoleEntity[];

  @ApiPropertyOptional({ 
    description: 'Perfiles de cliente asociados a este usuario',
    // 👇 FIX CRÍTICO: Función flecha + Array. Faltaba aquí.
    type: () => [ClientProfile] 
  })
  @OneToMany(() => ClientProfile, (cp) => cp.user)
  clientProfiles: ClientProfile[];
}