import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

import {
  PersonType,
  TaxIdType,
  ResidenceType,
  TaxRegimeType,
} from '../enums';

/**
 * @description DTO para la creación de Entidades Fiscales.
 * Valida condicionalmente los campos según el tipo de persona (Física/Jurídica).
 * Sincronizado con FacturaE y VeriFactu.
 * @version 2026.1.17
 */
export class CreateFiscalEntityDto {

  @ApiProperty({
    description: 'Tipo de persona física o jurídica',
    enum: PersonType,
    enumName: 'PersonType',
    example: PersonType.LEGAL_ENTITY,
  })
  @IsEnum(PersonType)
  @IsNotEmpty()
  personType: PersonType;

  @ApiProperty({
    description: `Tipo de identificación (Claves AEAT): 01: NIF/CIF, 02: NIF-IVA...`,
    enum: TaxIdType,
    enumName: 'TaxIdType',
    example: TaxIdType.NIF,
  })
  @IsEnum(TaxIdType)
  @IsNotEmpty()
  taxIdType: TaxIdType;

  @ApiProperty({
    description: 'Identificación fiscal (Normalizada a mayúsculas y sin espacios)',
    example: 'B12345678',
  })
  @IsString()
  @Length(3, 20)
  @IsNotEmpty()
  @Transform(({ value }) => value?.toUpperCase().replace(/\s/g, ''))
  taxId: string;

  @ApiPropertyOptional({
    description: 'Razón Social (Obligatorio para Personas Jurídicas)',
    example: 'Rentix Solutions S.L.',
  })
  @ValidateIf((o) => o.personType === PersonType.LEGAL_ENTITY)
  @IsNotEmpty({ message: 'La Razón Social es obligatoria para empresas' })
  @IsString()
  @Transform(({ value }) => value?.trim()) // 🔥 Limpieza de espacios
  corporateName?: string;

  @ApiPropertyOptional({
    description: 'Nombre Legal (Obligatorio para Personas Físicas)',
    example: 'Juan',
  })
  @ValidateIf((o) => o.personType === PersonType.INDIVIDUAL)
  @IsNotEmpty({ message: 'El Nombre es obligatorio para personas físicas' })
  @IsString()
  @Transform(({ value }) => value?.trim())
  legalName?: string;

  @ApiPropertyOptional({
    description: 'Apellidos (Obligatorio para Personas Físicas)',
    example: 'Pérez García',
  })
  @ValidateIf((o) => o.personType === PersonType.INDIVIDUAL)
  @IsNotEmpty({ message: 'Los Apellidos son obligatorios para personas físicas' })
  @IsString()
  @Transform(({ value }) => value?.trim())
  legalSurname?: string;

  @ApiPropertyOptional({
    description: 'Nombre comercial (Opcional)',
    example: 'Rentix App',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  tradeName?: string;

  @ApiPropertyOptional({
    description: 'Código de residencia fiscal según FacturaE',
    enum: ResidenceType,
    enumName: 'ResidenceType',
    example: ResidenceType.RESIDENT,
  })
  @IsOptional()
  @IsEnum(ResidenceType)
  residenceType?: ResidenceType;

  /**
   * @description Añadido para completar el esquema FacturaE.
   */
  @ApiPropertyOptional({
    description: 'Código ISO del país (3 caracteres, ej: ESP)',
    example: 'ESP',
    default: 'ESP',
  })
  @IsOptional()
  @IsString()
  @Length(3, 3, { message: 'El código de país debe tener 3 caracteres' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  countryCode?: string;

  @ApiPropertyOptional({
    description: 'Régimen de IVA aplicable (Claves VeriFactu/AEAT)',
    enum: TaxRegimeType,
    enumName: 'TaxRegimeType',
    example: TaxRegimeType.GENERAL,
  })
  @IsOptional()
  @IsEnum(TaxRegimeType)
  taxRegime?: TaxRegimeType;
}