import {
  Entity,
  Column,
  ManyToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Company } from 'src/company/entities/company.entity';
import { BaseEntity } from 'src/common/base/base.entity';

export enum RoleType {
  OWNER = 'owner',
  MANAGER = 'manager',
  CLIENT = 'client',
}

@Entity('user_company_roles')
export class UserCompanyRole extends BaseEntity{

  @Column({
    type: 'enum',
    enum: RoleType,
  })
  role: RoleType;

  // 👇 Cada rol pertenece a un usuario
  @ManyToOne(() => User, (user) => user.companyRoles, { onDelete: 'CASCADE' })
  user: User;

  // 👇 Cada rol pertenece a una empresa
  @ManyToOne(() => Company, (company) => company.companyRoles, { onDelete: 'CASCADE' })
  company: Company;
}
