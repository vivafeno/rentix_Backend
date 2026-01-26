import { Entity, Column, Index, OneToOne } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { Company } from '../../company/entities/company.entity';
import { PersonType, TaxIdType, ResidenceType } from '../enums'; 
import { Expose } from 'class-transformer';

/**
 * @class FiscalEntity
 * @description Identidad Fiscal Legal (AEAT Standard).
 * Soporta validación de NIF/CIF, tipos de residencia y razonamiento social.
 * @version 2026.2.0
 */
@Entity('fiscal_entities')
@Index('IDX_FISCAL_ENTITY_GLOBAL', ['nif'], {
  unique: true,
  where: 'company_id IS NULL', // Identidades maestras de la plataforma
})
@Index('IDX_FISCAL_ENTITY_TENANT', ['nif', 'companyId'], {
  unique: true,
  where: 'company_id IS NOT NULL', // Identidades de clientes por empresa
})
export class FiscalEntity extends BaseEntity {

  @ApiPropertyOptional({ description: 'Owner company ID (Null for global entities)' })
  @Expose()
  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId?: string;

  @ApiProperty({ enum: PersonType, description: 'F=Physical, J=Legal' })
  @Expose()
  @Column({
    name: 'person_type', // 🚩 Normalizado a inglés en DB para rigor 2026
    type: 'enum',
    enum: PersonType,
    default: PersonType.LEGAL_ENTITY,
  })
  personType!: PersonType;

  @ApiProperty({ enum: TaxIdType, description: '01=NIF/CIF, 02=Passport...' })
  @Expose()
  @Column({
    name: 'tax_id_type',
    type: 'enum',
    enum: TaxIdType,
    default: TaxIdType.NIF,
  })
  taxIdType!: TaxIdType;

  @ApiProperty({ example: 'B12345678', description: 'NIF/CIF Number' })
  @Expose()
  @Column({ name: 'nif', length: 20 })
  nif!: string;

  @ApiProperty({ example: 'Rentix Solutions S.L.', description: 'Legal Entity Name' })
  @Expose()
  @Column({ name: 'full_name' }) // 🚩 Mapeado a full_name para consistencia CRM
  fullName!: string;

  @ApiPropertyOptional({ example: 'Rentix', description: 'Trade name' })
  @Expose()
  @Column({ name: 'trade_name', nullable: true })
  tradeName?: string;

  @ApiProperty({ enum: ResidenceType, default: ResidenceType.RESIDENT })
  @Expose()
  @Column({
    name: 'residence_type',
    type: 'enum',
    enum: ResidenceType,
    default: ResidenceType.RESIDENT,
  })
  residenceType!: ResidenceType;

  @ApiProperty({ example: 'ES', default: 'ES', description: 'ISO 3166-1 alpha-2 country code' })
  @Expose()
  @Column({ name: 'country_code', length: 2, default: 'ES' })
  countryCode!: string;

  @OneToOne(() => Company, (company) => company.fiscalEntity)
  company!: Company;

  /**
   * @description Nombre sanitizado para Veri*factu.
   * El Frontend lo usará para mostrar nombres en mayúsculas en las facturas.
   */
  @Expose()
  @ApiProperty({ description: 'Normalized name for tax reporting' })
  get officialName(): string {
    return (this.fullName || 'UNKNOWN').trim().toUpperCase();
  }
}