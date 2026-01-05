import {
  Entity,
  Column,
  ManyToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Company } from 'src/company/entities/company.entity';
import { BaseEntity } from 'src/common/base/base.entity';
import { CompanyRole } from '../enums/company-role.enum';

@Entity('user_company_roles')
export class UserCompanyRole extends BaseEntity{

  @Column({
    type: 'enum',
    enum: CompanyRole,
  })
  role: CompanyRole;

  // 👇 Cada rol pertenece a un usuario
  @ManyToOne(() => User, (user) => user.companyRoles, { onDelete: 'CASCADE' })
  user: User;

  // 👇 Cada rol pertenece a una empresa
  @ManyToOne(() => Company, (company) => company.companyRoles, { onDelete: 'CASCADE' })
  company: Company;
}
