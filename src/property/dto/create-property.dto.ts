import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { PropertyType, PropertyStatus, PropertyOrientation } from '../enums';
import { CreateAddressDto } from '../../address/dto/create-address.dto';

/**
 * DTO para la creación de activos inmobiliarios.
 * * Estándares Blueprint 2026:
 * - Validación estricta de tipos nativos.
 * - Soporte para anidamiento de dirección física (CreateAddressDto).
 * - Alineación con campos técnicos y legales (RESO Standard).
 * * @author Rentix
 */
export class CreatePropertyDto {

  /* --- Identificación y Clasificación --- */

  @ApiProperty({ description: 'Referencia interna organizacional', example: 'P-VAL-001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  internalCode: string;

  @ApiProperty({ enum: PropertyType, description: 'Tipología funcional', example: PropertyType.RESIDENTIAL })
  @IsEnum(PropertyType)
  type: PropertyType;

  @ApiPropertyOptional({ enum: PropertyStatus, default: PropertyStatus.AVAILABLE })
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @ApiPropertyOptional({ example: '1234567AB1234C0001DE', maxLength: 25 })
  @IsOptional()
  @IsString()
  @MaxLength(25)
  cadastralReference?: string;

  /* --- Métricas Físicas --- */

  @ApiProperty({ description: 'Superficie total construida (m2)', example: 120.50 })
  @IsNumber()
  @Min(1)
  surfaceTotal: number;

  @ApiProperty({ description: 'Superficie útil habitable (m2)', example: 95.00 })
  @IsNumber()
  @Min(1)
  surfaceUseful: number;

  /* --- Datos Técnicos --- */

  @ApiPropertyOptional({ example: 1998 })
  @IsOptional()
  @IsInt()
  @Min(1800)
  @Max(2100)
  constructionYear?: number;

  @ApiPropertyOptional({ enum: PropertyOrientation })
  @IsOptional()
  @IsEnum(PropertyOrientation)
  orientation?: PropertyOrientation;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  bathrooms?: number;

  /* --- Eficiencia Energética --- */

  @ApiPropertyOptional({ description: 'Letra calificación energética', example: 'B' })
  @IsOptional()
  @IsString()
  @MaxLength(1)
  energyRating?: string;

  @ApiPropertyOptional({ description: 'Consumo kWh/m2 año', example: 45.2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  energyScore?: number;

  /* --- Dotaciones (Amenities) --- */

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasElevator?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasParking?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasStorageRoom?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasTerrace?: boolean;

  /* --- Localización --- */

  @ApiProperty({ type: CreateAddressDto, description: 'Objeto de dirección física' })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;

  @ApiPropertyOptional({ description: 'Memoria descriptiva o notas' })
  @IsOptional()
  @IsString()
  description?: string;
}