import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
} from 'class-validator';

import { PropertyType, PropertyStatus } from '../enums';

export class CreatePropertyDto {

  @ApiProperty({ description: 'ID de la dirección (Address type PROPERTY)', format: 'uuid' })
  @IsUUID()
  addressId: string;

  @ApiProperty({ example: 'P-VAL-001', required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ enum: PropertyType })
  @IsEnum(PropertyType)
  type: PropertyType;

  @ApiProperty({ enum: PropertyStatus })
  @IsEnum(PropertyStatus)
  status: PropertyStatus;

  @ApiProperty({ example: '1234567AB1234C0001DE', required: false })
  @IsOptional()
  @IsString()
  cadastralReference?: string;

  @ApiProperty({ example: 85, required: false })
  @IsOptional()
  @IsNumber()
  surfaceM2?: number;

  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @IsNumber()
  rooms?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @ApiProperty({ example: '3º', required: false })
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiProperty({ example: 39.4699, required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ example: -0.3763, required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
