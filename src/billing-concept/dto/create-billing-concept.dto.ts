import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateBillingConceptDto {
  @ApiProperty({ example: 'RENTA' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Alquiler mensual' })
  @IsString()
  label: string;

  @ApiPropertyOptional({ example: 1200.0 })
  @IsNumber()
  @IsOptional()
  defaultPrice?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  requiresPeriod?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isUniquePerPeriod?: boolean;

  @ApiProperty({ example: 'S', enum: ['P', 'S'] })
  @IsEnum(['P', 'S'])
  itemType: string;

  @ApiProperty({ example: 'uuid-del-iva' })
  @IsUUID()
  defaultTaxId: string;

  @ApiPropertyOptional({ example: 'uuid-del-irpf' })
  @IsUUID()
  @IsOptional()
  defaultRetentionId?: string;
}
