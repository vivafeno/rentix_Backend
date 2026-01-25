import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Company } from 'src/company/entities/company.entity';
import { TenantStatus } from '../enums/tenant-status.enum';
import { Contract } from 'src/contract/entities/contract.entity';
import { TenantProfile } from './../../tenant-profile/entities/tenant-profile.entity';
import { Contact } from '../../contact/entities/contact.entity';

/**
 * @class Tenant
 * @description Entidad que representa al Arrendatario (sujeto de derecho en el contrato).
 * Centraliza la relación entre la infraestructura de la empresa y la capa operativa del perfil.
 * @version 2026.2.2
 */
@Entity('tenants')
@Index(['companyId', 'email'], { unique: true })
export class Tenant extends BaseEntity {

  @ApiProperty({ description: 'Nombre completo o Razón Social del arrendatario', example: 'Juan Pérez' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Email principal para notificaciones legales', example: 'notificaciones@arrendatario.es' })
  @Column()
  email: string;

  @ApiProperty({ description: 'Estado operativo del arrendatario en el sistema', enum: TenantStatus })
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

  @ApiProperty({ 
    type: () => TenantProfile, 
    description: 'Perfil extendido con datos fiscales, bancarios y scoring' 
  })
  @OneToOne(() => TenantProfile, (profile) => profile.tenant, { 
    cascade: true, 
    eager: true 
  })
  profile: TenantProfile;

  @ApiPropertyOptional({ 
    type: () => [Contract], 
    description: 'Contratos de alquiler asociados a este arrendatario' 
  })
  @ManyToMany(() => Contract, (contract) => contract.tenants)
  contracts: Contract[];

  /**
   * Relación Inversa: Directorio de Contactos
   * @description Personas vinculadas al arrendatario (avalistas, convivientes, representantes)
   */
  @ApiPropertyOptional({ 
    type: () => [Contact], 
    description: 'Agenda de contactos vinculados (avalistas, representantes, familiares)' 
  })
  @OneToMany(() => Contact, (contact) => contact.tenant)
  contacts: Contact[];
}