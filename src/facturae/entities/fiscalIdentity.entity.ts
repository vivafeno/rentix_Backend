import { Column, Entity, Index, OneToOne } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../common/base/base.entity';
import { Company } from '../../company/entities/company.entity';
import { PersonType } from '../enums/personType.enum';
import { TaxIdType } from '../enums/taxIdType.enum';
import { ResidenceType } from '../enums/residenceType.enum';
import { Expose } from 'class-transformer';

@Entity('fiscal_identities')// 1. Índice para evitar duplicados GLOBALES (si no tienen empresa asociada, como tu propia empresa)
@Index('IDX_FISCAL_IDENTITY_GLOBAL_COMPANY', ['taxId'], {
  unique: true,
  where: 'company_id IS NULL'
})
// 2. Índice para evitar duplicados POR TENANT (Dos empresas distintas pueden tener el mismo cliente/proveedor guardado)
@Index('IDX_FISCAL_IDENTITY_PER_TENANT', ['taxId', 'companyId'], {
  unique: true,
  where: 'company_id IS NOT NULL'
})
export class FiscalIdentity extends BaseEntity {

  // --------------------------------------------------------------------------
  // RELACIÓN DE PERTENENCIA (TENANT)
  // --------------------------------------------------------------------------
  @ApiPropertyOptional({ description: 'ID de la empresa que gestiona este dato (Null si es una identidad global)' })
  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId?: string;

  // --------------------------------------------------------------------------
  // TIPO DE PERSONA Y DOCUMENTO
  // --------------------------------------------------------------------------
  @ApiProperty({
    description: 'Tipo de persona: F (Física/Autónomo) o J (Jurídica/Empresa)',
    enum: PersonType,
    example: PersonType.LEGAL_ENTITY,
  })
  @Column({
    name: 'person_type',
    type: 'enum',
    enum: PersonType,
    default: PersonType.LEGAL_ENTITY,
  })
  personType: PersonType;

  @ApiProperty({
    description: 'Tipo de documento fiscal (NIF, CIF, PASAPORTE)',
    enum: TaxIdType,
    example: TaxIdType.NIF,
  })
  @Column({
    name: 'tax_id_type',
    type: 'enum',
    enum: TaxIdType,
    default: TaxIdType.NIF,
  })
  taxIdType: TaxIdType;

  @ApiProperty({ description: 'Número de identificación fiscal', example: 'B12345678' })
  @Column({ name: 'tax_id', length: 20 })
  taxId: string;

  // --------------------------------------------------------------------------
  // NOMBRES (Física vs Jurídica)
  // --------------------------------------------------------------------------

  // OPCIÓN A: Para Empresas (J)
  @ApiPropertyOptional({ description: 'Razón Social (Solo si es Persona Jurídica)', example: 'Rentix Solutions S.L.' })
  @Column({ name: 'corporate_name', nullable: true })
  corporateName?: string;

  // OPCIÓN B: Para Personas Físicas (F)
  @ApiPropertyOptional({ description: 'Nombre Legal (Solo si es Persona Física)', example: 'Juan' })
  @Column({ name: 'legal_name', nullable: true }) // 👈 CAMBIO CRÍTICO PARA EL SEEDER
  legalName?: string;

  @ApiPropertyOptional({ description: 'Apellidos (Solo si es Persona Física)', example: 'Pérez García' })
  @Column({ name: 'legal_surname', nullable: true }) // 👈 CAMBIO CRÍTICO PARA EL SEEDER
  legalSurname?: string;

  // OPCIÓN C: Nombre Comercial (Opcional para ambos)
  @ApiPropertyOptional({ description: 'Nombre comercial o marca conocida', example: 'Rentix App' })
  @Column({ name: 'trade_name', nullable: true })
  tradeName?: string;

  // --------------------------------------------------------------------------
  // DATOS DE RESIDENCIA FISCAL
  // --------------------------------------------------------------------------
  @ApiProperty({
    description: 'Tipo de residencia (Residente, UE, Extra-UE)',
    enum: ResidenceType,
    default: ResidenceType.RESIDENT,
  })
  @Column({
    name: 'residence_type',
    type: 'enum',
    enum: ResidenceType,
    default: ResidenceType.RESIDENT,
  })
  residenceType: ResidenceType;

  @ApiProperty({ description: 'Código ISO del país', example: 'ESP', default: 'ESP' })
  @Column({ name: 'country_code', length: 3, default: 'ESP' })
  countryCode: string;

  // --------------------------------------------------------------------------
  // RELACIÓN INVERSA (Solo informativa para TypeORM)
  // --------------------------------------------------------------------------
  @OneToOne(() => Company, (company) => company.facturaeParty)
  company: Company;


  // --------------------------------------------------------------------------
  // GETTERS (Lógica Unificada)
  // --------------------------------------------------------------------------

  /**
   * Propiedad virtual para Swagger y Frontend.
   * Devuelve automáticamente la Razón Social o el Nombre+Apellidos según el tipo.
   */
  @Expose() // Permite que class-transformer lo muestre en JSON
  @ApiProperty({
    description: 'Nombre calculado automáticamente según normativa FacturaE (Razón Social o Nombre+Apellidos)',
    example: 'Rentix Solutions S.L.'
  })
  get facturaeName(): string {
    if (this.personType === PersonType.LEGAL_ENTITY) {
      return this.corporateName || 'Sin Razón Social';
    }
    // Lógica para Físicas: Nombre + Apellidos
    return `${this.legalName || ''} ${this.legalSurname || ''}`.trim() || 'Sin Nombre';
  }
}