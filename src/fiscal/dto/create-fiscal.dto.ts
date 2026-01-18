import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PersonType } from '../enums/personType.enum';
import { TaxIdType } from '../enums/taxIdType.enum';
import { ResidenceType } from '../enums/residenceType.enum';

export class CreateFiscalDto {
  @ApiProperty({ enum: PersonType })
  @IsEnum(PersonType)
  tipoPersona: PersonType;

  @ApiProperty({ enum: TaxIdType })
  @IsEnum(TaxIdType)
  tipoIdFiscal: TaxIdType;

  @ApiProperty({ example: 'B12345678' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  nif: string;

  @ApiProperty({ example: 'Rentix Solutions S.L.' })
  @IsString()
  @IsNotEmpty()
  nombreRazonSocial: string;

  @ApiPropertyOptional({ example: 'Rentix App' })
  @IsOptional()
  @IsString()
  nombreComercial?: string;

  @ApiProperty({ enum: ResidenceType })
  @IsEnum(ResidenceType)
  tipoResidencia: ResidenceType;

  @ApiProperty({ example: 'ESP' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(3)
  codigoPais: string;
}
