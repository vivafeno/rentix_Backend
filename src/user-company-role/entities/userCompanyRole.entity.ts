import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/base/base.entity';
import { User } from 'src/user/entities/user.entity';
import { Company } from 'src/company/entities/company.entity';
import { CompanyRole } from '../enums/companyRole.enum';

/**
 * @description Entidad de interceptación de seguridad (RBAC + ABAC).
 * Gestiona el acceso granular a Patrimonios (Companies) mediante Roles.
 * Implementa el 'Blindaje Total' de Rentix 2026.
 * @version 2026.2.0
 */
@Entity('company_roles')
@Index(['userId', 'companyId'], { unique: true }) // Evita duplicidad de roles para un mismo usuario en la misma empresa
@Index(['role'])
export class CompanyRoleEntity extends BaseEntity {
  /**
   * @description Autoridad delegada en el contexto patrimonial.
   * Determina las capacidades de facturación y gestión de activos.
   */
  @ApiProperty({
    description: 'Rol del usuario dentro de la empresa',
    enum: CompanyRole,
    example: CompanyRole.OWNER,
  })
  @Column({
    type: 'enum',
    enum: CompanyRole,
  })
  role: CompanyRole;

  /* ------------------------------------------------------------------
   * CONTEXTO DE USUARIO
   * ------------------------------------------------------------------ */

  /**
   * @description UUID del usuario vinculado.
   */
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  /**
   * @description Relación con la identidad del usuario.
   * Cascade desactivado: La eliminación de un rol no afecta a la entidad User.
   */
  @ApiProperty({
    description: 'Usuario vinculado al rol patrimonial',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.companyRoles, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /* ------------------------------------------------------------------
   * CONTEXTO PATRIMONIAL (COMPANY)
   * ------------------------------------------------------------------ */

  /**
   * @description UUID de la empresa (Patrimonio).
   */
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  /**
   * @description Relación con el patrimonio.
   * Fundamental para el filtrado de facturas y direcciones Veri*factu.
   */
  @ApiProperty({
    description: 'Empresa asociada a este nivel de autoridad',
    type: () => Company,
  })
  @ManyToOne(() => Company, (company) => company.companyRoles, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}

export { CompanyRole };
