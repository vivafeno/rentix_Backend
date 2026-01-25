import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/base/base.entity';
import { User } from 'src/user/entities/user.entity';
import { Company } from 'src/company/entities/company.entity';
import { CompanyRole } from '../enums/user-company-role.enum';

/**
 * @class CompanyRoleEntity
 * @description Tabla de unión (Junction Table) con metadatos de autoridad.
 * Implementa el Blindaje 2026: RBAC patrimonial.
 */
@Entity('user_company_roles') // Nombre más descriptivo para la tabla física
@Index(['userId', 'companyId'], { unique: true })
export class CompanyRoleEntity extends BaseEntity {

  @ApiProperty({
    description: 'Nivel de autoridad delegada',
    enum: CompanyRole,
    example: CompanyRole.OWNER,
  })
  @Column({
    type: 'enum',
    enum: CompanyRole,
    default: CompanyRole.VIEWER,
  })
  role: CompanyRole;

  /* --- CONTEXTO DE IDENTIDAD --- */

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.companyRoles, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /* --- CONTEXTO PATRIMONIAL --- */

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (company) => company.companyRoles, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  /* --- METADATOS OPERATIVOS --- */

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  @ApiProperty({ description: 'Define si es la empresa por defecto al hacer login' })
  isPrimary: boolean;
}