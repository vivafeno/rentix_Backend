import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Company } from 'src/company/entities/company.entity';

export enum RoleType {
  OWNER = 'owner',
  MANAGER = 'manager',
  CLIENT = 'client',
}

@Entity('user_company_roles')
export class UserCompanyRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: RoleType,
  })
  role: RoleType;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // 👇 Cada rol pertenece a un usuario
  @ManyToOne(() => User, (user) => user.companyRoles, { onDelete: 'CASCADE' })
  user: User;

  // 👇 Cada rol pertenece a una empresa
  @ManyToOne(() => Company, (company) => company.companyRoles, { onDelete: 'CASCADE' })
  company: Company;
}
