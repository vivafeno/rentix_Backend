import { Entity, Column, ManyToOne, OneToMany, OneToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/base/base.entity';
import { Company } from 'src/company/entities/company.entity';
import { FiscalEntity } from 'src/fiscal/entities/fiscalEntity';
import { Address } from 'src/address/entities/address.entity';
import { TenantStatus } from '../enums/tenant-status.enum';

/**
 * @class Tenant
 * @description Entidad Arrendatario. Gestiona el perfil receptor de facturas.
 * Alineado con FacturaE 3.2.x y Veri*factu.
 * @version 2026.2.0
 */
@Entity('tenants')
@Index(['companyId', 'fiscalIdentityId'], { unique: true })
export class Tenant extends BaseEntity {

  /* --- IDENTIFICACIÓN & ESTADO --- */

  @ApiProperty({ example: 'TEN-2026-001', description: 'Referencia interna administrativa' })
  @Column({ name: 'codigo_interno', nullable: true })
  codigoInterno: string; // 🚩 Sincronizado: internalCode -> codigoInterno

  @ApiProperty({ enum: TenantStatus, example: TenantStatus.ACTIVE })
  @Column({ type: 'enum', enum: TenantStatus, default: TenantStatus.ACTIVE })
  estado: TenantStatus; // 🚩 Sincronizado: status -> estado

  /* --- CONTACTO & COMUNICACIÓN --- */

  @ApiProperty({ example: 'facturacion@arrendatario.es' })
  @Column({ name: 'email_notificaciones', nullable: true })
  email: string;

  @ApiProperty({ example: '+34 600000000' })
  @Column({ name: 'telefono', nullable: true })
  telefono: string; // 🚩 Sincronizado

  /* --- INFORMACIÓN FINANCIERA (SEPA / FACTURAE) --- */

  @ApiProperty({ example: 'ES210000...', description: 'IBAN para remesas SEPA' })
  @Column({ name: 'iban_bancario', nullable: true, length: 34 })
  ibanBancario: string; // 🚩 Sincronizado

  /**
   * @description Código de Residencia AEAT: 1=España, 2=UE, 3=Extranjero.
   */
  @ApiProperty({ example: '1', description: 'Código de residencia fiscal' })
  @Column({ name: 'codigo_residencia', default: '1', length: 1 })
  codigoResidencia: string;

  /* --- RELACIONES & MULTI-TENANCY --- */

  @ApiProperty({ description: 'UUID de la empresa propietaria del registro' })
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  /**
   * @description Relación con la identidad legal (NIF/CIF).
   * Unimos por ID para facilitar la creación atómica desde el DTO.
   */
  @ApiProperty({ description: 'UUID de la identidad fiscal vinculada' })
  @Column({ name: 'fiscal_identity_id', type: 'uuid' })
  fiscalIdentityId: string;

  @OneToOne(() => FiscalEntity, { cascade: false, eager: true })
  @JoinColumn({ name: 'fiscal_identity_id' })
  fiscalIdentity: FiscalEntity;

  /**
   * @description Direcciones del inquilino.
   * La dirección con AddressType.FISCAL será la que use Veri*factu.
   */
  @ApiProperty({ type: () => Address, isArray: true })
  @OneToMany(() => Address, (address) => address.tenant, { cascade: true, eager: true })
  direcciones: Address[]; // 🚩 Sincronizado: addresses -> direcciones
}