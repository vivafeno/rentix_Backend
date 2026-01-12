import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsEnum, IsOptional, Min, Max, Length } from 'class-validator';

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

  @ApiProperty({ example: '01', enum: ['01', '02', '03', '04', '05'] })
  @IsEnum(['01', '02', '03', '04', '05'])
  taxType: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isRetention?: boolean;

  @ApiPropertyOptional({ example: 'Art. 20.1.23' })
  @IsString()
  @IsOptional()
  facturaeCode?: string;
}