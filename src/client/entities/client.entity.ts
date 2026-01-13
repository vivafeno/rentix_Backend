import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/base/base.entity';
import { Company } from 'src/company/entities/company.entity';
import { FiscalIdentity } from 'src/facturae/entities/fiscalIdentity.entity';
import { Address } from 'src/address/entities/address.entity';
import { ClientStatus } from '../enums/client-status.enum';

@Entity('clients')
export class Client extends BaseEntity {

  // --------------------------------------------------------------------------
  // DATOS IDENTIFICATIVOS & ESTADO
  // --------------------------------------------------------------------------
  @ApiProperty({ example: 'CLI-001', description: 'Código interno para uso administrativo' })
  @Column({ name: 'internal_code', nullable: true })
  internalCode: string;

  @ApiProperty({ enum: ClientStatus, example: ClientStatus.ACTIVE })
  @Column({ type: 'enum', enum: ClientStatus, default: ClientStatus.ACTIVE })
  status: ClientStatus;

  // --------------------------------------------------------------------------
  // DATOS DE CONTACTO (Notificaciones)
  // --------------------------------------------------------------------------
  @ApiProperty({ example: 'cliente@email.com', description: 'Email principal para notificaciones' })
  @Column({ nullable: true })
  email: string;

  @ApiProperty({ example: '+34 600 000 000', description: 'Teléfono de contacto' })
  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  // --------------------------------------------------------------------------
  // RELACIONES (Tenant Isolation & Datos Fiscales)
  // --------------------------------------------------------------------------

  // 1. EMPRESA (Propietaria del dato)
  @ApiProperty({ description: 'ID de la empresa que gestiona este cliente' })
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  // 2. IDENTIDAD FISCAL (Quién es legalmente: DNI, Nombre Real)
  @ApiProperty({ description: 'ID de la Identidad Fiscal (Facturae)' })
  @Column({ name: 'fiscal_identity_id', type: 'uuid' })
  fiscalIdentityId: string;

  @OneToOne(() => FiscalIdentity, { cascade: true, eager: true })
  @JoinColumn({ name: 'fiscal_identity_id' })
  fiscalIdentity: FiscalIdentity;

  // 3. DIRECCIÓN (Dónde vive actualmente / Dirección de Notificación)
  @ApiProperty({ description: 'ID de la Dirección postal actual del cliente' })
  @Column({ name: 'address_id', type: 'uuid', nullable: true })
  addressId: string;

  @OneToOne(() => Address, { cascade: true })
  @JoinColumn({ name: 'address_id' })
  address: Address;
}