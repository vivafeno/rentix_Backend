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
  })
  personType: PersonType;

  @ApiProperty({
    enum: TaxIdType,
    example: TaxIdType.CIF,
  })
  @Column({
    type: 'enum',
    enum: TaxIdType,
  })
  taxIdType: TaxIdType;

  @ApiProperty({
    description: 'Identificador fiscal (NIF, CIF, NIE, VAT, etc.)',
    example: 'B12345678',
  })
  @Column()
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
