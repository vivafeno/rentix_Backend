import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/base/base.entity';
import { Company } from 'src/company/entities/company.entity';
import { FiscalEntity } from 'src/fiscal/entities/fiscalEntity';
import { Address } from 'src/address/entities/address.entity';
import { TenantStatus } from '../enums/tenant-status.enum';

/**
 * @class Tenant
 * @description Entidad Arrendatario. Gestiona el perfil receptor de facturas y SEPA.
 * @version 2026.2.1
 * @author Rentix
 */
@Entity('tenants')
@Index(['companyId', 'fiscalIdentityId'], { unique: true })
export class Tenant extends BaseEntity {
  /* --- IDENTIFICACIÓN & ESTADO --- */

  @ApiProperty({ description: 'Referencia interna administrativa' })
  @Column({ name: 'codigo_interno', nullable: true })
  codigoInterno: string;

  @ApiProperty({ enum: TenantStatus })
  @Column({ type: 'enum', enum: TenantStatus, default: TenantStatus.ACTIVE })
  estado: TenantStatus;

  /* --- CONTACTO --- */

  @ApiProperty({ example: 'facturacion@arrendatario.es' })
  @Column({ name: 'email_notificaciones', nullable: true })
  email: string;

  @ApiProperty({ example: '+34 600000000' })
  @Column({ name: 'telefono', nullable: true })
  telefono: string;

  /* --- INFORMACIÓN FINANCIERA --- */

  @ApiProperty({ description: 'IBAN para remesas SEPA' })
  @Column({ name: 'iban_bancario', nullable: true, length: 34 })
  ibanBancario: string;

  @ApiProperty({
    description: 'Código de residencia fiscal (1=ES, 2=UE, 3=EXT)',
  })
  @Column({ name: 'codigo_residencia', default: '1', length: 1 })
  codigoResidencia: string;

  /* --- RELACIONES --- */

  @ApiProperty({ description: 'UUID de la empresa propietaria' })
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ApiProperty({ description: 'UUID de la identidad fiscal vinculada' })
  @Column({ name: 'fiscal_identity_id', type: 'uuid' })
  fiscalIdentityId: string;

  @OneToOne(() => FiscalEntity, { cascade: false, eager: true })
  @JoinColumn({ name: 'fiscal_identity_id' })
  fiscalIdentity: FiscalEntity;

  /**
   * @description Relación bidireccional con direcciones.
   * Se usa 'direcciones' en lugar de 'addresses' para consistencia con el Blueprint.
   */
  @ApiProperty({ type: () => Address, isArray: true })
  @OneToMany(() => Address, (address) => address.tenant, {
    cascade: true,
    eager: false, // Cambiado a false para optimizar rendimiento si no se requiere siempre
  })
  direcciones: Address[];
}
