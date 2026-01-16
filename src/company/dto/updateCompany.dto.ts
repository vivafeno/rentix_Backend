import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, ValidateNested, IsString, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

// DTOs auxiliares para validar los objetos anidados
class UpdateFacturaePartyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  corporateName?: string;

  // El taxId (CIF) no solemos dejarlo editar, pero si quieres:
  // @IsOptional() @IsString() taxId?: string;
}

class UpdateFiscalAddressDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  countryCode?: string;
}

export class UpdateCompanyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateFacturaePartyDto)
  facturaeParty?: UpdateFacturaePartyDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateFiscalAddressDto)
  fiscalAddress?: UpdateFiscalAddressDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;
}