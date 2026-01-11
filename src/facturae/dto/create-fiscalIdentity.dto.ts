import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';

import {
  PersonType,
  TaxIdType,
  ResidenceType,
  TaxRegimeType,
} from '../enums';

/**
 * CreateFiscalIdentityDto
 *
 * Contrato estricto para la creación de identidades fiscales.
 * Alineado con la normativa Facturae (Orden HAP/1650/2015) y AEAT.
 *
 * Valida condicionalmente los nombres según si es Persona Física o Jurídica.
 */
export class CreateFiscalIdentityDto {

  /* ------------------------------------------------------------------
   * CLASIFICACIÓN (Base de la validación)
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Clasificación de la entidad: "Individual" (Autónomo) o "LegalEntity" (Empresa)',
    enum: PersonType,
    example: PersonType.LEGAL_ENTITY,
  })
  @IsEnum(PersonType, { message: 'El tipo debe ser Individual o LegalEntity' })
  @IsNotEmpty()
  personType: PersonType;

  /* ------------------------------------------------------------------
   * IDENTIFICACIÓN FISCAL (AEAT)
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: `Tipo de Documento (Claves AEAT):
    - 01: NIF/DNI/NIE (España)
    - 02: NIF-IVA (Operador Intracomunitario / VIES)
    - 03: Pasaporte
    - 04: ID Extranjero (Fuera de la UE)
    `,
    enum: TaxIdType,
    example: TaxIdType.NIF, // Se enviará '01'
  })
  @IsEnum(TaxIdType)
  @IsNotEmpty()
  taxIdType: TaxIdType;

  @ApiProperty({
    description: 'Número de identificación fiscal (Sin guiones ni espacios)',
    example: 'B12345678',
  })
  @IsString()
  @Length(3, 20)
  @IsNotEmpty()
  taxId: string;

  /* ------------------------------------------------------------------
   * DATOS NOMINATIVOS (Validación Condicional / Polimórfica)
   * ------------------------------------------------------------------ */

  @ApiPropertyOptional({
    description: 'Razón Social. **OBLIGATORIO** si personType es LEGAL_ENTITY.',
    example: 'Rentix Solutions S.L.',
  })
  @ValidateIf((o) => o.personType === PersonType.LEGAL_ENTITY)
  @IsNotEmpty({ message: 'La Razón Social es obligatoria para Personas Jurídicas' })
  @IsString()
  corporateName?: string;

  @ApiPropertyOptional({
    description: 'Nombre de pila. **OBLIGATORIO** si personType es INDIVIDUAL.',
    example: 'Juan',
  })
  @ValidateIf((o) => o.personType === PersonType.INDIVIDUAL)
  @IsNotEmpty({ message: 'El Nombre es obligatorio para Personas Físicas' })
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Apellidos. **OBLIGATORIO** si personType es INDIVIDUAL.',
    example: 'Pérez García',
  })
  @ValidateIf((o) => o.personType === PersonType.INDIVIDUAL)
  @IsNotEmpty({ message: 'Los Apellidos son obligatorios para Personas Físicas' })
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Nombre comercial (Marca conocida). Opcional.',
    example: 'Rentix App',
  })
  @IsOptional()
  @IsString()
  tradeName?: string;

  /* ------------------------------------------------------------------
   * CONTEXTO FISCAL (Facturae)
   * ------------------------------------------------------------------ */

  @ApiPropertyOptional({
    description: 'Código de residencia: R (España), U (UE), E (Extranjero)',
    enum: ResidenceType,
    default: ResidenceType.RESIDENT,
    example: ResidenceType.RESIDENT, // Se enviará 'R'
  })
  @IsOptional()
  @IsEnum(ResidenceType)
  residenceType?: ResidenceType;

  @ApiPropertyOptional({
    description: 'Código país ISO 3166-1 alpha-3. Facturae exige 3 letras (ej: ESP, FRA).',
    example: 'ESP',
    default: 'ESP',
    minLength: 3,
    maxLength: 3,
  })
  @IsOptional()
  @IsString()
  @Length(3, 3, { message: 'El código de país debe ser ISO Alpha-3 (3 letras, ej: ESP)' })
  countryCode?: string;

  @ApiPropertyOptional({
    description: 'Régimen Fiscal (Clave AEAT): 01 (General), 07 (Criterio de Caja)...',
    enum: TaxRegimeType,
    default: TaxRegimeType.GENERAL,
    example: TaxRegimeType.GENERAL, // Se enviará '01'
  })
  @IsOptional()
  @IsEnum(TaxRegimeType)
  taxRegime?: TaxRegimeType;
}