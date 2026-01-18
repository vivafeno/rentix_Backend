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
 * @description DTO para la creación de activos inmobiliarios.
 * Sincronizado con la entidad Property (Veri*factu Ready).
 * @version 2026.2.0
 */
export class CreatePropertyDto {

  /* --- Identificación y Clasificación --- */

  @ApiProperty({ description: 'Referencia interna (ej. P-VAL-001)', example: 'P-VAL-001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  codigoInterno: string; // 🚩 Refactorizado: internalCode -> codigoInterno

  @ApiProperty({ enum: PropertyType, description: 'Tipología funcional' })
  @IsEnum(PropertyType)
  tipo: PropertyType; // 🚩 Refactorizado: type -> tipo

  @ApiPropertyOptional({ enum: PropertyStatus, default: PropertyStatus.AVAILABLE })
  @IsOptional()
  @IsEnum(PropertyStatus)
  estado?: PropertyStatus; // 🚩 Refactorizado: status -> estado

  @ApiPropertyOptional({ description: 'Referencia Catastral (Veri*factu)', example: '1234567AB1234C0001DE' })
  @IsOptional()
  @IsString()
  @MaxLength(25)
  referenciaCatastral?: string; // 🚩 Refactorizado: cadastralReference -> referenciaCatastral

  /* --- Métricas Físicas --- */

  @ApiProperty({ description: 'Superficie total construida (m2)', example: 120.50 })
  @IsNumber()
  @Min(1)
  superficieConstruida: number; // 🚩 Refactorizado

  @ApiProperty({ description: 'Superficie útil habitable (m2)', example: 95.00 })
  @IsNumber()
  @Min(1)
  superficieUtil: number; // 🚩 Refactorizado

  /* --- Datos Técnicos --- */

  @ApiPropertyOptional({ description: 'Año de construcción', example: 1998 })
  @IsOptional()
  @IsInt()
  @Min(1800)
  @Max(2100)
  anoConstruccion?: number; // 🚩 Refactorizado

  @ApiPropertyOptional({ enum: PropertyOrientation })
  @IsOptional()
  @IsEnum(PropertyOrientation)
  orientacion?: PropertyOrientation; // 🚩 Refactorizado

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  dormitorios?: number; // 🚩 Refactorizado

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  baños?: number; // 🚩 Refactorizado

  /* --- Eficiencia Energética --- */

  @ApiPropertyOptional({ description: 'Calificación energética (A-G)', example: 'B' })
  @IsOptional()
  @IsString()
  @MaxLength(1)
  certificadoEnergetico?: string; // 🚩 Refactorizado

  @ApiPropertyOptional({ description: 'Consumo kWh/m2 año', example: 45.2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  puntuacionEnergetica?: number; // 🚩 Refactorizado

  /* --- Dotaciones (Amenities) --- */

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  tieneAscensor?: boolean; // 🚩 Refactorizado

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  tieneParking?: boolean; // 🚩 Refactorizado

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  tieneTrastero?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  tieneTerraza?: boolean;

  /* --- Localización --- */

  /**
   * @description Dirección física. Veri*factu exige que el inmueble esté localizado.
   */
  @ApiProperty({ type: CreateAddressDto, description: 'Objeto de dirección física' })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;

  @ApiPropertyOptional({ description: 'Notas adicionales' })
  @IsOptional()
  @IsString()
  notas?: string;
}