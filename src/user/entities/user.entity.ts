import { Entity, Column, OneToMany, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

import { BaseEntity } from 'src/common/base/base.entity';
import { AppRole } from 'src/auth/enums/user-global-role.enum';
import { CompanyRoleEntity } from 'src/user-company-role/entities/user-company-role.entity';
import { TenantProfile } from 'src/tenant-profile/entities/tenant-profile.entity';

/**
 * @class User
 * @description Entidad fundamental de Identidad en Rentix.
 * Implementa Rigor 2026: Tipado explícito para PostgreSQL y seguridad de serialización.
 */
@Entity('users')
export class User extends BaseEntity {

  /* --- 🔐 CREDENCIALES & SEGURIDAD --- */

  @ApiProperty({ example: 'admin@rentix.com' })
  @Index({ unique: true }) // Rigor: Índice único a nivel de DB
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', select: false }) 
  @Exclude()
  password: string;

  @ApiProperty({ enum: AppRole, default: AppRole.USER })
  @Column({
    name: 'app_role',
    type: 'enum',
    enum: AppRole,
    default: AppRole.USER,
  })
  appRole: AppRole;

  @Column({ name: 'is_email_verified', type: 'boolean', default: false })
  isEmailVerified: boolean;

  // 🚩 SOLUCIÓN AL ERROR: Forzamos 'text' para evitar la inferencia 'Object'
  @Column({ name: 'refresh_token_hash', type: 'text', nullable: true, select: false })
  @Exclude()
  refreshTokenHash?: string | null;

  /* --- 👤 DATOS PERSONALES (Normalizados) --- */

  @ApiPropertyOptional({ example: 'Carlos' })
  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Sanz' })
  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName?: string;

  @ApiPropertyOptional({ example: '+34600112233' })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl?: string;

  /* --- 🌍 LOCALIZACIÓN & PREFERENCIAS (Rigor 2026) --- */

  @Column({ type: 'varchar', length: 5, default: 'es' })
  language: string;

  @Column({ name: 'timezone', type: 'varchar', length: 50, default: 'Europe/Madrid' })
  timezone: string;

  /* --- 📈 AUDITORÍA & ONBOARDING --- */

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ name: 'onboarding_step', type: 'int', default: 1 })
  onboardingStep: number;

  @Column({ name: 'accepted_terms_at', type: 'timestamp', nullable: true })
  acceptedTermsAt?: Date;

  /* --- 🏗️ RELACIONES --- */

  @ApiPropertyOptional({ type: () => [CompanyRoleEntity] })
  @OneToMany(() => CompanyRoleEntity, (ucr) => ucr.user, { cascade: true })
  companyRoles: CompanyRoleEntity[];

  @ApiPropertyOptional({ type: () => [TenantProfile] })
  @OneToMany(() => TenantProfile, (tp) => tp.user, { cascade: true })
  tenantProfiles: TenantProfile[];

  /* --- 🛠️ VIRTUALS --- */

  get fullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
}