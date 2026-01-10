// src/facturae/entities/facturaeParty.entity.ts

import { Column, Entity } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseEntity } from '../../common/base/base.entity';

import { PersonType } from '../enums/personType.enum';
import { TaxIdType } from '../enums/taxIdTtype.enum';
import { ResidenceType } from '../enums/residenceType.enum';
import { SubjectType } from '../enums/subjectType.enum';
import { TaxRegimeType } from '../enums/taxRegimeType.enum';

@Entity('facturae_parties')
export class FacturaeParty extends BaseEntity {

  /* ------------------------------------------------------------------
   * IDENTIDAD
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Razón social o nombre completo',
    example: 'ACME SL',
  })
  @Column()
  legalName: string;

  @ApiPropertyOptional({
    description: 'Nombre comercial',
    example: 'ACME',
  })
  @Column({ nullable: true })
  tradeName?: string;

  /* ------------------------------------------------------------------
   * CLASIFICACIÓN FACTURAE
   * ------------------------------------------------------------------ */

  @ApiProperty({
    enum: PersonType,
    example: PersonType.LEGAL_ENTITY,
  })
  @Column({
    type: 'enum',
    enum: PersonType,
    enumName: 'facturae_person_type_enum',
  })
  personType: PersonType;

  @ApiProperty({
    enum: TaxIdType,
    example: TaxIdType.CIF,
  })
  @Column({
    type: 'enum',
    enum: TaxIdType,
    enumName: 'facturae_tax_id_type_enum',
  })
  taxIdType: TaxIdType;

  @ApiProperty({
    description: 'Identificador fiscal (NIF, CIF, NIE, VAT, etc.)',
    example: 'B12345678',
  })
  @Column({ unique: true })
  taxId: string;

  /* ------------------------------------------------------------------
   * RESIDENCIA Y RÉGIMEN
   * ------------------------------------------------------------------ */

  @ApiProperty({
    enum: ResidenceType,
    example: ResidenceType.RESIDENT,
  })
  @Column({
    type: 'enum',
    enum: ResidenceType,
    enumName: 'facturae_residence_type_enum',
    default: ResidenceType.RESIDENT,
  })
  residenceType: ResidenceType;

  @ApiPropertyOptional({
    enum: SubjectType,
    example: SubjectType.SUBJECT,
  })
  @Column({
    type: 'enum',
    enum: SubjectType,
    enumName: 'facturae_subject_type_enum',
    nullable: true,
  })
  subjectType?: SubjectType;

  @ApiPropertyOptional({
    enum: TaxRegimeType,
    example: TaxRegimeType.GENERAL,
  })
  @Column({
    type: 'enum',
    enum: TaxRegimeType,
    enumName: 'facturae_tax_regime_type_enum',
    nullable: true,
  })
  taxRegime?: TaxRegimeType;

  /* ------------------------------------------------------------------
   * PAÍS
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Código de país ISO 3166-1 alpha-2',
    example: 'ES',
  })
  @Column({
    length: 2,
    default: 'ES',
  })
  countryCode: string;
}
