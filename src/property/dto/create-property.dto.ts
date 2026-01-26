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
  IsUUID,
  Matches,
} from 'class-validator';
import { PropertyType, PropertyStatus, PropertyOrientation } from '../enums';
import { CreateAddressDto } from '../../address/dto/create-address.dto';

/**
 * @class CreatePropertyDto
 * @description DTO Maestro para el alta de activos inmobiliarios.
 * Optimizado para generación de modelos en Angular 21 y cumplimiento Veri*factu.
 * @version 2026.3.0
 */
export class CreatePropertyDto {

  /* --- INFRAESTRUCTURA --- */

  @ApiProperty({ 
    description: 'ID de la empresa propietaria del activo',
    example: 'd820581a-bad3-4ab2-af8f-7529890219a2',
    format: 'uuid' 
  })
  @IsUUID('4')
  @IsNotEmpty()
  companyId!: string;

  /* --- IDENTIFICACIÓN --- */

  @ApiProperty({ 
    description: 'Código de referencia interna único por empresa', 
    example: 'P-001',
    maxLength: 50 
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  internalCode!: string;

  @ApiProperty({ 
    enum: PropertyType, 
    enumName: 'PropertyType', // 🚩 RIGOR: Permite a Angular exportar el Enum correctamente
    description: 'Tipo de inmueble según clasificación Rentix' 
  })
  @IsEnum(PropertyType)
  type!: PropertyType;

  @ApiPropertyOptional({ 
    enum: PropertyStatus, 
    enumName: 'PropertyStatus', 
    default: PropertyStatus.AVAILABLE,
    description: 'Estado operativo inicial del inmueble' 
  })
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @ApiPropertyOptional({ 
    description: 'Referencia Catastral (20 caracteres exactos según estándar AEAT)', 
    example: '1234567AB1234C0001DE',
    minLength: 20,
    maxLength: 20
  })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9A-Z]{20}$/, { 
    message: 'La referencia catastral debe cumplir el formato oficial de 20 caracteres alfanuméricos' 
  })
  cadastralReference?: string;

  /* --- MÉTRICAS --- */

  @ApiProperty({ 
    description: 'Superficie total construida en metros cuadrados', 
    example: 120.5,
    minimum: 0 
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  builtArea!: number;

  @ApiProperty({ 
    description: 'Superficie útil computable en metros cuadrados', 
    example: 95.0,
    minimum: 0 
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  usefulArea!: number;

  /* --- DATOS TÉCNICOS --- */

  @ApiPropertyOptional({ description: 'Año de construcción del edificio', example: 1998 })
  @IsOptional()
  @IsInt()
  @Min(1700)
  @Max(2100)
  constructionYear?: number;

  @ApiPropertyOptional({ 
    enum: PropertyOrientation, 
    enumName: 'PropertyOrientation',
    description: 'Orientación principal para análisis de eficiencia' 
  })
  @IsOptional()
  @IsEnum(PropertyOrientation)
  orientation?: PropertyOrientation;

  @ApiPropertyOptional({ description: 'Número de dormitorios', example: 3, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional({ description: 'Número de cuartos de baño completos', example: 2, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  bathrooms?: number;

  /* --- EFICIENCIA ENERGÉTICA --- */

  @ApiPropertyOptional({ 
    description: 'Calificación energética (Letra A a G)', 
    example: 'B',
    maxLength: 2 
  })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  energyCertificate?: string;

  @ApiPropertyOptional({ 
    description: 'Valor numérico de consumo energético (kWh/m² año)', 
    example: 45.2 
  })
  @IsOptional()
  @IsNumber()
  energyScore?: number;

  /* --- DOTACIONES Y EQUIPAMIENTO --- */

  @ApiPropertyOptional({ description: 'Indica si el edificio dispone de ascensor', default: false })
  @IsOptional()
  @IsBoolean()
  hasElevator?: boolean;

  @ApiPropertyOptional({ description: 'Indica si dispone de plaza de garaje vinculada', default: false })
  @IsOptional()
  @IsBoolean()
  hasParking?: boolean;

  @ApiPropertyOptional({ description: 'Indica si dispone de trastero', default: false })
  @IsOptional()
  @IsBoolean()
  hasStorageRoom?: boolean;

  @ApiPropertyOptional({ description: 'Indica si dispone de terraza o balcón exterior', default: false })
  @IsOptional()
  @IsBoolean()
  hasTerrace?: boolean;

  /* --- LOCALIZACIÓN --- */

  /**
   * @description Objeto de dirección atómico. 
   * La validación anidada asegura integridad en la creación del inmueble.
   */
  @ApiProperty({ 
    type: () => CreateAddressDto, 
    description: 'Datos de geolocalización y dirección postal' 
  })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  @IsNotEmpty()
  address!: CreateAddressDto;

  @ApiPropertyOptional({ 
    description: 'Observaciones internas o notas de gestión',
    example: 'Pendiente de reforma en cocina' 
  })
  @IsOptional()
  @IsString()
  notes?: string;
}