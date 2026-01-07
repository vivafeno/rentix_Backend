import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsISO31661Alpha2,
  IsOptional,
  IsString,
} from 'class-validator';

import { AddressType } from '../enums/addressType.enum';
import { AddressStatus } from '../enums/addressStatus.enum';

/**
 * DTO para la creación de una dirección.
 *
 * Pensado para flujos multi-step:
 * - creación en estado DRAFT
 * - asociación posterior a Company o ClientProfile
 */
export class CreateAddressDto {

  /* ------------------------------------------------------------------
   * ESTADO
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Estado inicial de la dirección',
    enum: AddressStatus,
    example: AddressStatus.DRAFT,
    default: AddressStatus.DRAFT,
    required: false,
  })
  @IsOptional()
  @IsEnum(AddressStatus)
  status?: AddressStatus;

  /* ------------------------------------------------------------------
   * TIPO DE DIRECCIÓN
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Tipo de dirección dentro del sistema',
    enum: AddressType,
    example: AddressType.FISCAL,
  })
  @IsEnum(AddressType)
  type: AddressType;

  /* ------------------------------------------------------------------
   * DATOS POSTALES
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Dirección principal',
    example: 'Calle Mayor 12',
  })
  @IsString()
  addressLine1: string;

  @ApiProperty({
    description: 'Información adicional de la dirección',
    example: '2º B',
    required: false,
  })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({
    description: 'Código postal',
    example: '46060',
  })
  @IsString()
  postalCode: string;

  @ApiProperty({
    description: 'Ciudad / municipio',
    example: 'Valencia',
  })
  @IsString()
  city: string;

  @ApiProperty({
    description: 'Provincia (opcional fuera de España)',
    example: 'Valencia',
    required: false,
  })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiProperty({
    description: 'Código de país ISO-3166-1 alpha-2',
    example: 'ES',
    default: 'ES',
  })
  @IsISO31661Alpha2()
  countryCode: string;

  /* ------------------------------------------------------------------
   * CONTROL
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Indica si es la dirección principal para su tipo',
    example: true,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
