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
 * @description DTO para la creación de direcciones (Veri*factu / FacturaE Compliant).
 * Sincronizado con la entidad Address para evitar transformaciones costosas en el Service.
 * @version 2026.2.0
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
    description: 'Vía pública, número, piso y puerta (Línea única para Veri*factu)',
    example: 'Calle de Alcalá 1, Piso 2º Derecha'
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  direccion: string; // 🚩 Refactorizado: de addressLine1/2 a campo único

  @ApiProperty({
    description: 'Código Postal (Normativa AEAT)',
    example: '28014'
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 16)
  @Transform(({ value }) => value?.trim())
  codigoPostal: string; // 🚩 Refactorizado: de postalCode a codigoPostal

  @ApiProperty({ description: 'Localidad / Ciudad', example: 'Madrid' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  poblacion: string; // 🚩 Refactorizado: de city a poblacion

  @ApiPropertyOptional({ description: 'Provincia o Región', example: 'Madrid' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  provincia?: string; // 🚩 Refactorizado: de province a provincia

  @ApiProperty({
    description: 'Código de país ISO 3166-1 alpha-3',
    example: 'ESP',
    default: 'ESP'
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3, { message: 'El código de país debe ser ISO Alpha-3 (ej. ESP)' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  codigoPais: string = 'ESP'; // 🚩 Refactorizado: de countryCode a codigoPais
}