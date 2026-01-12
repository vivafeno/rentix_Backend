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
  MaxLength,
} from 'class-validator';
import { PropertyType } from '../enums/property-type.enum';
import { PropertyStatus } from '../enums/property-status.enum'; // Asegúrate de importar el enum correcto
import { CreateAddressDto } from '../../address/dto/create-address.dto';

export class CreatePropertyDto {

  /* ─────────────────────────────────────────────────────────────────
   * 1. IDENTIFICACIÓN Y GESTIÓN
   * ───────────────────────────────────────────────────────────────── */

  @ApiProperty({ description: 'Referencia interna (ej: P-VAL-001)', example: 'P-VAL-001' })
  @IsString()
  @IsNotEmpty()
  internalCode: string; // He renombrado 'reference' a 'internalCode' para consistencia con ClientProfile

  @ApiProperty({ description: 'Alias amigable (ej: Ático Centro)', example: 'Ático Centro' })
  @IsString()
  @IsNotEmpty()
  name: string; // Campo nuevo vital para listados en el front

  @ApiProperty({ enum: PropertyType, example: PropertyType.RESIDENTIAL })
  @IsEnum(PropertyType)
  type: PropertyType;

  @ApiPropertyOptional({ enum: PropertyStatus, default: PropertyStatus.AVAILABLE })
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus; // Opcional, por defecto será AVAILABLE en la entidad

  /* ─────────────────────────────────────────────────────────────────
   * 2. DIRECCIÓN (CAMBIO CLAVE: OBJETO, NO ID)
   * ───────────────────────────────────────────────────────────────── */
  
  @ApiProperty({ type: CreateAddressDto, description: 'Datos de la dirección física' })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto; 
  // 👆 ESTO SOLUCIONA TU ERROR.
  // En lugar de pedir un ID, pedimos los datos para crearla al vuelo.

  /* ─────────────────────────────────────────────────────────────────
   * 3. DATOS LEGALES / ECONÓMICOS
   * ───────────────────────────────────────────────────────────────── */

  @ApiPropertyOptional({ example: '1234567AB1234C0001DE', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  cadastralReference?: string;

  @ApiPropertyOptional({ description: 'Precio base alquiler', example: 850.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rentPrice?: number;

  /* ─────────────────────────────────────────────────────────────────
   * 4. DATOS FÍSICOS (TUS CAMPOS ORIGINALES)
   * ───────────────────────────────────────────────────────────────── */

  @ApiPropertyOptional({ example: 85 })
  @IsOptional()
  @IsNumber()
  surfaceM2?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt() // Mejor IsInt que IsNumber para cosas que no pueden ser decimales
  @Min(0)
  rooms?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  bathrooms?: number;

  @ApiPropertyOptional({ example: '3º' })
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiPropertyOptional({ description: 'Notas internas' })
  @IsOptional()
  @IsString()
  description?: string;

  /* ─────────────────────────────────────────────────────────────────
   * 5. GEO
   * ───────────────────────────────────────────────────────────────── */

  @ApiPropertyOptional({ example: 39.4699 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: -0.3763 })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}