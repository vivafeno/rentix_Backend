import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  Length,
  IsUUID
} from 'class-validator';
import { Transform } from 'class-transformer';
import { AddressType } from '../enums/addressType.enum';
import { AddressStatus } from '../enums/addressStatus.enum';

/**
 * @description DTO para la creación de direcciones postales y fiscales.
 * Incluye metadatos de Swagger para generación de tipos en Angular.
 * @version 2026.1.17
 */
export class CreateAddressDto {

  @ApiPropertyOptional({
    description: 'ID de la empresa (Tenant Isolation)',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @ApiProperty({
    description: 'Propósito legal o físico de la dirección',
    enum: AddressType,
    enumName: 'AddressType',
    example: AddressType.FISCAL,
  })
  @IsEnum(AddressType)
  @IsNotEmpty()
  type: AddressType;

  @ApiPropertyOptional({
    description: 'Estado administrativo del registro',
    enum: AddressStatus,
    enumName: 'AddressStatus',
    default: AddressStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(AddressStatus)
  status?: AddressStatus = AddressStatus.ACTIVE;

  @ApiPropertyOptional({
    description: 'Marca esta dirección como la principal para el sujeto',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean = false;

  @ApiProperty({
    description: 'Vía pública y número (Nodo <Address> en FacturaE)',
    example: 'Calle de Alcalá 1'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  addressLine1: string;

  @ApiPropertyOptional({
    description: 'Información adicional (Piso, puerta, bloque...)',
    example: 'Piso 2º Derecha'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  addressLine2?: string;

  @ApiProperty({
    description: 'Código Postal (Validación FacturaE)',
    example: '28014'
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 16)
  @Transform(({ value }) => value?.trim())
  postalCode: string;

  @ApiProperty({ description: 'Ciudad o Localidad', example: 'Madrid' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  city: string;

  @ApiPropertyOptional({ description: 'Provincia o Región', example: 'Madrid' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  province?: string;

  @ApiProperty({
    description: 'Código de país ISO 3166-1 alpha-3',
    example: 'ESP',
    default: 'ESP'
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3, { message: 'El código de país debe tener exactamente 3 caracteres (ISO Alpha-3)' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  countryCode: string = 'ESP';
}