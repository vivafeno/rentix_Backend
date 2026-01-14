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
import { PropertyStatus } from '../enums/property-status.enum';
import { CreateAddressDto } from '../../address/dto/create-address.dto';

export class CreatePropertyDto {

  @ApiProperty({ description: 'Referencia interna única', example: 'P-VAL-001' })
  @IsString()
  @IsNotEmpty()
  internalCode: string;

  @ApiProperty({ description: 'Alias del inmueble', example: 'Ático Centro' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: PropertyType, enumName: 'PropertyType', example: PropertyType.RESIDENTIAL })
  @IsEnum(PropertyType)
  type: PropertyType;

  @ApiPropertyOptional({ enum: PropertyStatus, enumName: 'PropertyStatus', default: PropertyStatus.AVAILABLE })
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @ApiProperty({ type: CreateAddressDto, description: 'Dirección física' })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;

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

  @ApiPropertyOptional({ example: 85 })
  @IsOptional()
  @IsNumber()
  surfaceM2?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
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

  @ApiPropertyOptional({ example: 39.4699 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: -0.3763 })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}