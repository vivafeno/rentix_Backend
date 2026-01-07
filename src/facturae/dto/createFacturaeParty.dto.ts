import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

import {
  PersonType,
  TaxIdType,
  ResidenceType,
  SubjectType,
  TaxRegimeType,
} from '../enums';

/**
 * CreateFacturaePartyDto
 *
 * Contrato para crear una identidad fiscal (FacturaeParty)
 *
 * Se usa en:
 * - Wizard de creación de empresa
 * - Creación de clientes / proveedores (futuro)
 */
export class CreateFacturaePartyDto {

  /* ------------------------------------------------------------------
   * IDENTIDAD
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Razón social o nombre completo',
    example: 'ACME SL',
  })
  @IsString()
  legalName: string;

  @ApiPropertyOptional({
    description: 'Nombre comercial',
    example: 'ACME',
  })
  @IsOptional()
  @IsString()
  tradeName?: string;

  /* ------------------------------------------------------------------
   * CLASIFICACIÓN FACTURAE
   * ------------------------------------------------------------------ */

  @ApiProperty({
    enum: PersonType,
    example: PersonType.LEGAL_ENTITY,
  })
  @IsEnum(PersonType)
  personType: PersonType;

  @ApiProperty({
    enum: TaxIdType,
    example: TaxIdType.CIF,
  })
  @IsEnum(TaxIdType)
  taxIdType: TaxIdType;

  @ApiProperty({
    description: 'Identificador fiscal (NIF, CIF, NIE, VAT, etc.)',
    example: 'B12345678',
  })
  @IsString()
  @Length(3, 32)
  taxId: string;

  /* ------------------------------------------------------------------
   * RESIDENCIA Y RÉGIMEN
   * ------------------------------------------------------------------ */

  @ApiPropertyOptional({
    enum: ResidenceType,
    example: ResidenceType.RESIDENT,
    description: 'Residencia fiscal según Facturae (por defecto RESIDENT)',
  })
  @IsOptional()
  @IsEnum(ResidenceType)
  residenceType?: ResidenceType;

  @ApiPropertyOptional({
    enum: SubjectType,
    example: SubjectType.SUBJECT,
  })
  @IsOptional()
  @IsEnum(SubjectType)
  subjectType?: SubjectType;

  @ApiPropertyOptional({
    enum: TaxRegimeType,
    example: TaxRegimeType.GENERAL,
  })
  @IsOptional()
  @IsEnum(TaxRegimeType)
  taxRegime?: TaxRegimeType;

  /* ------------------------------------------------------------------
   * PAÍS
   * ------------------------------------------------------------------ */

  @ApiPropertyOptional({
    description: 'Código de país ISO 3166-1 alpha-2 (por defecto ES)',
    example: 'ES',
  })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  countryCode?: string;
}
