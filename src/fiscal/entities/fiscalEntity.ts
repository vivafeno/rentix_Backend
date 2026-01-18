import { Column, Entity, Index, OneToOne } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../common/base/base.entity';
import { Company } from '../../company/entities/company.entity';
import { PersonType } from '../enums/personType.enum';
import { TaxIdType } from '../enums/taxIdType.enum';
import { ResidenceType } from '../enums/residenceType.enum';
import { Expose } from 'class-transformer';

/**
 * @description Entidad que representa la Identidad Fiscal legal (Persona Física o Jurídica).
 * Centraliza los datos necesarios para el cumplimiento de normativas de facturación (FacturaE, VeriFactu).
 * @version 2026.1.17
 */
@Entity('fiscal_entities')
@Index('IDX_FISCAL_ENTITY_GLOBAL_COMPANY', ['taxId'], {
  unique: true,
  where: 'company_id IS NULL'
})
@Index('IDX_FISCAL_ENTITY_PER_TENANT', ['taxId', 'companyId'], {
  unique: true,
  where: 'company_id IS NOT NULL'
})
export class FiscalEntity extends BaseEntity {

  /* ------------------------------------------------------------------
   * CONTEXTO MULTI-TENANT
   * ------------------------------------------------------------------ */

  @ApiPropertyOptional({ description: 'ID de la empresa propietaria del dato (Null si es global)' })
  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId?: string;

  /* ------------------------------------------------------------------
   * IDENTIFICACIÓN LEGAL
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Tipo de persona: F (Física) o J (Jurídica)',
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
    description: 'Tipo de documento fiscal (01: NIF/CIF, 02: Pasaporte...)',
    enum: TaxIdType,
  })
  @Column({
    name: 'tax_id_type',
    type: 'enum',
    enum: TaxIdType,
    default: TaxIdType.NIF,
  })
  taxIdType: TaxIdType;

  @ApiProperty({ description: 'NIF, CIF o equivalente fiscal', example: 'B12345678' })
  @Column({ name: 'tax_id', length: 20 })
  taxId: string;

  /* ------------------------------------------------------------------
   * NOMBRES Y RAZÓN SOCIAL
   * ------------------------------------------------------------------ */

  @ApiPropertyOptional({ description: 'Razón Social (Solo para Persona Jurídica)', example: 'Rentix Solutions S.L.' })
  @Column({ name: 'corporate_name', nullable: true })
  corporateName?: string;

  @ApiPropertyOptional({ description: 'Nombre Legal (Solo para Persona Física)', example: 'Juan' })
  @Column({ name: 'legal_name', nullable: true })
  legalName?: string;

  @ApiPropertyOptional({ description: 'Apellidos (Solo para Persona Física)', example: 'Pérez García' })
  @Column({ name: 'legal_surname', nullable: true })
  legalSurname?: string;

  @ApiPropertyOptional({ description: 'Nombre comercial o marca conocida', example: 'Rentix App' })
  @Column({ name: 'trade_name', nullable: true })
  tradeName?: string;

  /* ------------------------------------------------------------------
   * RESIDENCIA FISCAL
   * ------------------------------------------------------------------ */

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

  @ApiProperty({ description: 'Código ISO del país (3 caracteres)', example: 'ESP', default: 'ESP' })
  @Column({ name: 'country_code', length: 3, default: 'ESP' })
  countryCode: string;

  /* ------------------------------------------------------------------
   * RELACIONES
   * ------------------------------------------------------------------ */

  /**
   * @description Relación inversa con Company. 
   * Se utiliza facturaeParty como nombre de propiedad para mantener compatibilidad con el esquema FacturaE.
   */
  @OneToOne(() => Company, (company) => company.facturaeParty)
  company: Company;

  /* ------------------------------------------------------------------
   * GETTERS (Lógica Unificada)
   * ------------------------------------------------------------------ */

  /**
   * @description Nombre calculado automáticamente para exportaciones FacturaE.
   * Devuelve Razón Social para empresas o Nombre+Apellidos para individuos.
   */
  @Expose()
  @ApiProperty({
    description: 'Nombre calculado para documentos oficiales',
    example: 'Rentix Solutions S.L.'
  })
  get facturaeName(): string {
    if (this.personType === PersonType.LEGAL_ENTITY) {
      return this.corporateName || 'Sin Razón Social';
    }
    return `${this.legalName || ''} ${this.legalSurname || ''}`.trim() || 'Sin Nombre';
  }
}