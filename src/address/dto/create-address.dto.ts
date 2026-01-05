import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsISO31661Alpha2,
  IsOptional,
  IsString,
} from 'class-validator';
import { AddressType } from '../enums/addres-type.enum';

export class CreateAddressDto {

  @ApiProperty({
    description: 'Tipo de dirección',
    enum: AddressType,
    example: AddressType.FISCAL,
  })
  @IsEnum(AddressType)
  type: AddressType;

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
    description: 'Ciudad',
    example: 'Valencia',
  })
  @IsString()
  city: string;

  @ApiProperty({
    description: 'Provincia',
    example: 'Valencia',
  })
  @IsString()
  province: string;

  @ApiProperty({
    description: 'Código de país ISO-3166-1 alpha-2',
    example: 'ES',
    default: 'ES',
    required: false,
  })
  @IsOptional()
  @IsISO31661Alpha2()
  countryCode?: string;

  @ApiProperty({
    description: 'Indica si es la dirección principal para su tipo',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
