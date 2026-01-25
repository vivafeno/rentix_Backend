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
 * @description DTO Maestro para el alta de activos. 
 * Integra validación técnica y geográfica (Veri*factu Ready).
 * @version 2026.2.2
 */
export class CreatePropertyDto {

  /* --- INFRAESTRUCTURA --- */

  @ApiProperty({ description: 'ID de la empresa propietaria' })
  @IsUUID('4')
  @IsNotEmpty()
  companyId: string;

  /* --- IDENTIFICACIÓN --- */

  @ApiProperty({ description: 'Código interno (ej. P-001)', example: 'P-001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  internalCode: string;

  @ApiProperty({ enum: PropertyType })
  @IsEnum(PropertyType)
  type: PropertyType;

  @ApiPropertyOptional({ enum: PropertyStatus, default: PropertyStatus.AVAILABLE })
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @ApiPropertyOptional({ 
    description: 'Referencia Catastral (20 caracteres exactos)', 
    example: '1234567AB1234C0001DE' 
  })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9A-Z]{20}$/, { message: 'La referencia catastral debe tener 20 caracteres alfanuméricos' })
  cadastralReference?: string;

  /* --- MÉTRICAS --- */

  @ApiProperty({ description: 'Superficie construida m2', example: 120.5 })
  @IsNumber()
  @Min(0)
  builtArea: number;

  @ApiProperty({ description: 'Superficie útil m2', example: 95.0 })
  @IsNumber()
  @Min(0)
  usefulArea: number;

  /* --- DATOS TÉCNICOS --- */

  @ApiPropertyOptional({ description: 'Año construcción', example: 1998 })
  @IsOptional()
  @IsInt()
  @Min(1700)
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

  /* --- EFICIENCIA --- */

  @ApiPropertyOptional({ description: 'Etiqueta energética (A-G)', example: 'B' })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  energyCertificate?: string;

  @ApiPropertyOptional({ description: 'Consumo kWh/m2 año', example: 45.2 })
  @IsOptional()
  @IsNumber()
  energyScore?: number;

  /* --- DOTACIONES --- */

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

  /* --- LOCALIZACIÓN --- */

  @ApiProperty({ type: CreateAddressDto })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  @IsNotEmpty()
  address: CreateAddressDto;

  @ApiPropertyOptional({ description: 'Notas internas' })
  @IsOptional()
  @IsString()
  notes?: string;
}