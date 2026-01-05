import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsISO31661Alpha2,
  Min,
  Max,
} from 'class-validator';

export class CreateVatRateDto {
  @ApiProperty({
    description: 'Tipo de IVA',
    example: 'IVA_GENERAL',
  })
  @IsString()
  tipo: string;

  @ApiProperty({
    description: 'Descripción legible',
    example: 'IVA general',
  })
  @IsString()
  descripcion: string;

  @ApiProperty({
    description: 'Porcentaje de IVA',
    example: 21,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  porcentaje: number;

  @ApiProperty({
    description: 'Código de país ISO-3166-1 alpha-2',
    example: 'ES',
  })
  @IsISO31661Alpha2()
  countryCode: string;

  @ApiProperty({
    description: 'Indica si es el IVA por defecto',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({
    description: 'Indica si el IVA está activo',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
