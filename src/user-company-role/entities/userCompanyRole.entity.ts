import {
  Entity,
  Column,
  ManyToOne,
} from 'typeorm';
import {
  ApiProperty,
} from '@nestjs/swagger';

import { BaseEntity } from 'src/common/base/base.entity';
import { User } from 'src/user/entities/user.entity';
import { Company } from 'src/company/entities/company.entity';
import { CompanyRole } from '../enums/userCompanyRole.enum';

/**
 * Entidad UserCompanyRole
 *
 * Representa el vínculo entre:
 * - un usuario
 * - una empresa
 * - y el rol que ejerce en ella
 *
 * Es una entidad de dominio clave para:
 * - permisos
 * - navegación del frontend
 * - facturación multiempresa
 */
@Entity('user_company_roles')
export class UserCompanyRole extends BaseEntity {

  /* ------------------------------------------------------------------
   * ROL
   * ------------------------------------------------------------------ */

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
  user: User;

  /* ------------------------------------------------------------------
   * RELACIÓN CON EMPRESA
   * ------------------------------------------------------------------ */

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
  company: Company;
}
