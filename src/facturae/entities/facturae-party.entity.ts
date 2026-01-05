import { Entity, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/base/base.entity';
import { PersonType } from '../enums/person-type.enum';
import { TaxIdType } from '../enums/tax-id-type.enum';
import { TaxRegime } from '../enums/tax-regime.enum';
import { SubjectType } from '../enums/subject-type.enum';

@Entity('facturae_parties')
export class FacturaeParty extends BaseEntity {

  @ApiProperty({ enum: PersonType })
  @Column({
    name: 'person_type',
    type: 'enum',
    enum: PersonType,
  })
  personType: PersonType;

  @ApiProperty({ enum: TaxIdType })
  @Column({
    name: 'tax_id_type',
    type: 'enum',
    enum: TaxIdType,
  })
  taxIdType: TaxIdType;

  @ApiProperty({ example: 'B12345678' })
  @Column({ name: 'tax_id' })
  taxId: string;

  @ApiProperty({ example: 'Industria Soluciones SL' })
  @Column({ name: 'legal_name' })
  legalName: string;

  @ApiProperty({ example: 'InduSol', required: false })
  @Column({ name: 'trade_name', nullable: true })
  tradeName?: string;

  @ApiProperty({ enum: TaxRegime })
  @Column({
    name: 'tax_regime',
    type: 'enum',
    enum: TaxRegime,
    default: TaxRegime.GENERAL,
  })
  taxRegime: TaxRegime;

  @ApiProperty({ enum: SubjectType })
  @Column({
    name: 'subject_type',
    type: 'enum',
    enum: SubjectType,
    default: SubjectType.SUBJECT,
  })
  subjectType: SubjectType;
}
