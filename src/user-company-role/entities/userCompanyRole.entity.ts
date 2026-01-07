import {
  Entity,
  Column,
  ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/base/base.entity';
import { User } from 'src/user/entities/user.entity';
import { Company } from 'src/company/entities/company.entity';
import { CompanyRole } from '../enums/userCompanyRole.enum';

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
   * RELACIONES
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Usuario al que pertenece el rol',
    type: () => User,
  })
  @ManyToOne(
    () => User,
    (user) => user.companyRoles,
    { onDelete: 'CASCADE' },
  )
  user: User;

  @ApiProperty({
    description: 'Empresa a la que pertenece el rol',
    type: () => Company,
  })
  @ManyToOne(
    () => Company,
    (company) => company.companyRoles,
    { onDelete: 'CASCADE' },
  )
  company: Company;
}
