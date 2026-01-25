import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
  ManyToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/base/base.entity';
import { Company } from 'src/company/entities/company.entity';
import { TenantStatus } from '../enums/tenant-status.enum';
import { Contract } from 'src/contract/entities/contract.entity';
import { TenantProfile } from './../../tenant-profile/entities/tenant-profile.entity';

@Entity('tenants')
@Index(['companyId', 'email'], { unique: true }) // El email es la clave natural por empresa
export class Tenant extends BaseEntity {

  @ApiProperty({ example: 'Juan Pérez' })
  @Column()
  name: string;

  @ApiProperty({ example: 'notificaciones@arrendatario.es' })
  @Column()
  email: string;

  @ApiProperty({ enum: TenantStatus })
  @Column({ 
    type: 'enum', 
    enum: TenantStatus, 
    default: TenantStatus.ACTIVE 
  })
  status: TenantStatus;

  /* --- VÍNCULOS DE INFRAESTRUCTURA --- */

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  /* --- CAPA OPERATIVA (Rigor 2026) --- */

  @ApiProperty({ type: () => TenantProfile })
  @OneToOne(() => TenantProfile, (profile) => profile.tenant, { 
    cascade: true, 
    eager: true 
  })
  profile: TenantProfile; // 🚩 Aquí cuelga todo lo fiscal, bancario y CRM

  @ManyToMany(() => Contract, (contract) => contract.tenants)
  contracts: Contract[];
}