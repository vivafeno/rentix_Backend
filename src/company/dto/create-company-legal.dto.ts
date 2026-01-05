import { ApiProperty } from '@nestjs/swagger';
import { PersonType } from 'src/facturae/enums/person-type.enum';
import { TaxIdType } from 'src/facturae/enums/tax-id-type.enum';
import { TaxRegime } from 'src/facturae/enums/tax-regime.enum';
import { SubjectType } from 'src/facturae/enums/subject-type.enum';

export class CreateCompanyLegalDto {
  @ApiProperty({
    example: PersonType.LEGAL_ENTITY,
    enum: PersonType,
    description: 'Tipo de persona según Facturae',
  })
  personType: PersonType;

  @ApiProperty({
    example: TaxIdType.CIF,
    enum: TaxIdType,
    description: 'Tipo de identificación fiscal',
  })
  taxIdType: TaxIdType;

  @ApiProperty({
    example: 'B12345678',
    description: 'NIF / CIF',
  })
  taxId: string;

  @ApiProperty({
    example: 'Empresa Demo SL',
    description: 'Razón social',
  })
  legalName: string;

  @ApiProperty({
    example: 'Empresa Demo',
    required: false,
    description: 'Nombre comercial (opcional)',
  })
  tradeName?: string;

  @ApiProperty({
    enum: TaxRegime,
    required: false,
  })
  taxRegime?: TaxRegime;

  @ApiProperty({
    enum: SubjectType,
    required: false,
  })
  subjectType?: SubjectType;
}
