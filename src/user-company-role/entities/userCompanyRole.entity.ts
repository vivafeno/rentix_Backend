import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/base/base.entity';
import { User } from 'src/user/entities/user.entity';
import { Company } from 'src/company/entities/company.entity';
import { CompanyRole } from '../enums/companyRole.enum';

/**
 * @description Entidad que gestiona la relación N:M entre Usuarios y Empresas (Patrimonios).
 * Define el nivel de autoridad (OWNER, TENANT, VIEWER) en un contexto específico.
 * @version 2026.1.17
 */
@Entity('company_roles')
export class CompanyRoleEntity extends BaseEntity {

  /**
   * @description Rol asignado al usuario en esta empresa/patrimonio.
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
   * RELACIÓN CON USUARIO
   * ------------------------------------------------------------------ */

  /**
   * @description ID del usuario vinculado (Campo de solo lectura para lógica de negocio).
   */
  @Column({ name: 'user_id' })
  userId: string;

  /**
   * @description Relación ManyToOne con la entidad User.
   * Cascade desactivado aquí para dejar que User controle la persistencia.
   */
  @ApiProperty({
    description: 'Usuario al que pertenece este rol',
    type: () => User,
  })
  @ManyToOne(
    () => User,
    (user) => user.companyRoles,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  @JoinColumn({ name: 'user_id' })
  user: User;

  /* ------------------------------------------------------------------
   * RELACIÓN CON EMPRESA
   * ------------------------------------------------------------------ */

  /**
   * @description ID de la empresa vinculada (Campo de solo lectura para lógica de negocio).
   */
  @Column({ name: 'company_id' })
  companyId: string;

  /**
   * @description Relación ManyToOne con la entidad Company (Patrimonio).
   */
  @ApiProperty({
    description: 'Empresa a la que pertenece este rol',
    type: () => Company,
  })
  @ManyToOne(
    () => Company,
    (company) => company.companyRoles,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  @JoinColumn({ name: 'company_id' })
  company: Company;
}

export { CompanyRole };
