import { Entity, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/base/base.entity';
import {
  PersonType,
  TaxIdType,
  TaxRegime,
  SubjectType,
} from '../enums';

@Entity('facturae_parties')
export class FacturaeParty extends BaseEntity {

  @ApiProperty({
    description: 'Tipo de persona fiscal según Facturae',
    enum: PersonType,
    example: PersonType.LEGAL_ENTITY,
  })
  @Column({
    name: 'person_type',
    type: 'enum',
    enum: PersonType,
  })
  personType: PersonType;

  @ApiProperty({
    description: 'Tipo de identificación fiscal',
    enum: TaxIdType,
    example: TaxIdType.CIF,
  })
  @Column({
    name: 'tax_id_type',
    type: 'enum',
    enum: TaxIdType,
  })
  taxIdType: TaxIdType;

  @ApiProperty({
    description: 'Identificador fiscal (NIF, CIF, NIE)',
    example: 'B12345678',
  })
  @Column({
    name: 'tax_id',
  })
  taxId: string;

  @ApiProperty({
    description: 'Nombre legal o razón social',
    example: 'Industria Soluciones SL',
  })
  @Column({
    name: 'legal_name',
  })
  legalName: string;

  // ─────────────────────────────────────────────
  // OPCIONAL FACTURAE ① – Nombre comercial
  // ─────────────────────────────────────────────
  @ApiProperty({
    description: 'Nombre comercial (opcional según Facturae)',
    example: 'InduSol',
    required: false,
  })
  @Column({
    name: 'trade_name',
    nullable: true,
  })
  tradeName?: string;

  // ─────────────────────────────────────────────
  // OPCIONAL FACTURAE ② – Régimen fiscal
  // ─────────────────────────────────────────────
  @ApiProperty({
    description: 'Régimen fiscal (opcional según Facturae)',
    enum: TaxRegime,
    example: TaxRegime.GENERAL,
    required: false,
  })
  @Column({
    name: 'tax_regime',
    type: 'enum',
    enum: TaxRegime,
    nullable: true,
  })
  taxRegime?: TaxRegime;

  // ─────────────────────────────────────────────
  // OPCIONAL FACTURAE ③ – Sujeto / exento
  // ─────────────────────────────────────────────
  @ApiProperty({
    description: 'Sujeto o exento de impuestos (opcional según Facturae)',
    enum: SubjectType,
    example: SubjectType.SUBJECT,
    required: false,
  })
  @Column({
    name: 'subject_type',
    type: 'enum',
    enum: SubjectType,
    nullable: true,
  })
  subjectType?: SubjectType;
}
