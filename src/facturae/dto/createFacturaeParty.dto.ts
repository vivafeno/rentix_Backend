import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  PersonType,
  TaxIdType,
  TaxRegime,
  SubjectType,
  ResidenceType,
} from '../enums';

/**
 * DTO Facturae – Party (Emisor/Receptor)
 * Alineado con especificación Facturae (AEAT)
 */
export class CreateFacturaePartyDto {

  @ApiProperty({
    description: 'Tipo de persona fiscal',
    enum: PersonType,
    example: PersonType.LEGAL_ENTITY,
  })
  @IsEnum(PersonType)
  personType: PersonType;

  @ApiProperty({
    description: 'Tipo de identificación fiscal',
    enum: TaxIdType,
    example: TaxIdType.CIF,
  })
  @IsEnum(TaxIdType)
  taxIdType: TaxIdType;

  @ApiProperty({
    description: 'Identificador fiscal (NIF, CIF, NIE, etc.)',
    example: 'B12345678',
  })
  @IsString()
  taxId: string;

  @ApiProperty({
    description: 'Nombre legal o razón social',
    example: 'Industria Soluciones SL',
  })
  @IsString()
  legalName: string;

  @ApiProperty({
    description: 'Nombre comercial',
    example: 'InduSol',
    required: false,
  })
  @IsOptional()
  @IsString()
  tradeName?: string;

  @ApiProperty({
    description: 'Régimen fiscal',
    enum: TaxRegime,
    default: TaxRegime.GENERAL,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaxRegime)
  taxRegime?: TaxRegime;

  @ApiProperty({
    description: 'Sujeto o exento de impuestos',
    enum: SubjectType,
    default: SubjectType.SUBJECT,
    required: false,
  })
  @IsOptional()
  @IsEnum(SubjectType)
  subjectType?: SubjectType;

  @ApiProperty({
    description: 'Residencia fiscal según Facturae',
    enum: ResidenceType,
    example: ResidenceType.RESIDENT,
    required: false,
  })
  @IsOptional()
  @IsEnum(ResidenceType)
  residenceType?: ResidenceType;
}
