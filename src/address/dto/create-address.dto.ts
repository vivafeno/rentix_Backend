import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsEnum, 
  IsBoolean, 
  IsOptional, 
  Length, 
  Matches,
  IsUUID,
  MaxLength
} from 'class-validator';
import { AddressType } from '../enums';

/**
 * @class CreateAddressDto
 * @description DTO para la creación de localizaciones.
 * Cumple con el estándar ISO 3166-1 alpha-2 y rigor AEAT.
 * @version 2026.2.1
 */
export class CreateAddressDto {

  /* --- CONTEXTO --- */

  @ApiPropertyOptional({ description: 'ID de la empresa (Tenant Context)' })
  @IsUUID('4')
  @IsOptional()
  companyId?: string;

  /* --- ATRIBUTOS DE NEGOCIO --- */

  @ApiProperty({ enum: AddressType, enumName: 'AddressType' })
  @IsEnum(AddressType)
  @IsNotEmpty()
  type: AddressType;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  /* --- DATOS POSTALES --- */

  @ApiProperty({ example: 'Calle Mayor 1, 2ºB' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  street: string;

  @ApiProperty({ 
    description: 'Código postal (5 dígitos para ES, hasta 10 para internacional)', 
    example: '28001' 
  })
  @IsString()
  @IsNotEmpty()
  /**
   * Rigor Rentix 2026: 
   * Validamos formato alfanumérico para compatibilidad con UK/PT/ES.
   */
  @Matches(/^[a-zA-Z0-9 -]{2,10}$/, { message: 'El código postal no tiene un formato válido' })
  zipCode: string;

  @ApiProperty({ example: 'Madrid' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({ example: 'Madrid' })
  @IsString()
  @IsOptional()
  province?: string;

  @ApiProperty({ 
    description: 'Código de país ISO 3166-1 alpha-2',
    example: 'ES', 
    default: 'ES' 
  })
  @IsString()
  @Length(2, 2)
  @Matches(/^[A-Z]{2}$/, { message: 'El código de país debe ser de 2 letras en mayúsculas' })
  countryCode: string;
}