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

export class CreateWithholdingRateDto {
  @ApiProperty({
    description: 'Tipo de retención',
    example: 'IRPF',
  })
  @IsString()
  tipo: string;

  @ApiProperty({
    description: 'Descripción legible',
    example: 'Retención IRPF general',
  })
  @IsString()
  descripcion: string;

  @ApiProperty({
    description: 'Porcentaje de retención',
    example: 19,
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
    description: 'Indica si es la retención por defecto',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({
    description: 'Indica si la retención está activa',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
