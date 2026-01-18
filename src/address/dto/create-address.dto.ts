import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  Length,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { AddressType } from '../enums/addressType.enum';
import { AddressStatus } from '../enums/addressStatus.enum';

/**
 * @class CreateAddressDto
 * @description DTO para la creación de direcciones (Veri*factu / FacturaE Compliant).
 * Implementa tipado estricto en transformaciones para cumplir con el linter.
 * @version 2026.2.1
 */
export class CreateAddressDto {
  @ApiPropertyOptional({
    description: 'ID de la empresa (Tenant Isolation)',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
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
    default: AddressStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(AddressStatus)
  status?: AddressStatus = AddressStatus.ACTIVE;

  @ApiPropertyOptional({
    description: 'Marca esta dirección como la principal para el sujeto',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean = false;

  @ApiProperty({
    description:
      'Vía pública, número, piso y puerta (Línea única para Veri*factu)',
    example: 'Calle de Alcalá 1, Piso 2º Derecha',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  direccion: string;

  @ApiProperty({
    description: 'Código Postal (Normativa AEAT)',
    example: '28014',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 16)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  codigoPostal: string;

  @ApiProperty({ description: 'Localidad / Ciudad', example: 'Madrid' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  poblacion: string;

  @ApiPropertyOptional({ description: 'Provincia o Región', example: 'Madrid' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  provincia?: string;

  @ApiProperty({
    description: 'Código de país ISO 3166-1 alpha-3',
    example: 'ESP',
    default: 'ESP',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3, { message: 'El código de país debe ser ISO Alpha-3 (ej. ESP)' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toUpperCase().trim() : value,
  )
  codigoPais: string = 'ESP';
}
