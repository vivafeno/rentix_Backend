import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsEnum, IsOptional, Min, Max, Length } from 'class-validator';
import { TaxType } from '../enums/tax-type.enum';

export class CreateTaxDto {
  @ApiProperty({ example: 'IVA 21%', minLength: 3, maxLength: 50 })
  @IsString()
  @Length(3, 50)
  name: string;

  @ApiProperty({ example: 21.00, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  rate: number;

  @ApiProperty({ 
    example: TaxType.VAT, 
    enum: TaxType, 
    enumName: 'TaxType',
    description: 'Tipo lógico para Facturae' 
  })
  @IsEnum(TaxType)
  type: TaxType;

  @ApiPropertyOptional({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isRetention?: boolean;

  @ApiPropertyOptional({ example: '01', description: 'Código oficial Facturae' })
  @IsString()
  @IsOptional()
  facturaeCode?: string;
}