import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { AddressType } from '../../address/enums/addressType.enum';

/**
 * @class CreateAddressDto
 * @description DTO para la creación y validación de direcciones postales (Rentix 2026).
 * Alineado con el estándar de la AEAT para evitar discrepancias en la generación de XML.
 * @version 2026.2.0
 */
export class CreateAddressDto {
  /**
   * @description Tipo de uso de la dirección.
   * @example 'FISCAL'
   */
  @ApiProperty({
    description: 'Propósito de la dirección (FISCAL, PROPIEDAD, etc.)',
    enum: AddressType,
    enumName: 'AddressType',
  })
  @IsEnum(AddressType)
  @IsNotEmpty()
  type: AddressType;

  /**
   * @description Dirección completa (Vía, nombre, número, piso).
   * Veri*factu no permite división por líneas.
   */
  @ApiProperty({
    description: 'Calle, número, portal y planta en una sola línea',
    example: 'Calle de Alcalá 1, 2ºB',
  })
  @IsString()
  @IsNotEmpty({ message: 'La dirección es obligatoria para la validación fiscal' })
  @Transform(({ value }) => value?.trim())
  direccion: string;

  /**
   * @description Código postal nacional o internacional.
   */
  @ApiProperty({
    description: 'Código postal (máx. 16 caracteres para internacional)',
    example: '28014',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 16)
  @Transform(({ value }) => value?.trim())
  codigoPostal: string;

  /**
   * @description Ciudad o Municipio.
   */
  @ApiProperty({
    description: 'Población o Municipio',
    example: 'Madrid',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  poblacion: string;

  /**
   * @description Provincia o Estado.
   */
  @ApiPropertyOptional({
    description: 'Provincia o Estado',
    example: 'Madrid',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  provincia?: string;

  /**
   * @description Código de país en formato ISO 3166-1 alpha-3.
   * @default 'ESP'
   */
  @ApiProperty({
    description: 'Código ISO del país (3 caracteres)',
    example: 'ESP',
    default: 'ESP',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3, { message: 'El código de país debe ser ISO alpha-3 (ej: ESP)' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  codigoPais: string = 'ESP';

  /**
   * @description Indica si es la dirección por defecto para el contexto dado.
   */
  @ApiPropertyOptional({
    description: 'Establecer como dirección principal',
    default: false,
  })
  @IsOptional()
  isDefault?: boolean;
}