import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsOptional,
  ValidateNested,
  IsEmail,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

import { CreateFiscalDto } from '../../fiscal/dto/create-fiscal.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';

/**
 * @class UpdateFiscalEntityDto
 * @description DTO parcial para la actualización de la Identidad Fiscal.
 */
export class UpdateFiscalEntityDto extends PartialType(CreateFiscalDto) {}

/**
 * @class UpdateFiscalAddressDto
 * @description DTO parcial para la actualización de la Dirección Fiscal.
 */
export class UpdateFiscalAddressDto extends PartialType(CreateAddressDto) {}

/**
 * @class UpdateCompanyDto
 * @description DTO para la actualización de Empresa/Patrimonio (Rentix 2026).
 * Resuelve errores de linter mediante tipado estricto en transformaciones.
 * @version 2026.2.0
 */
export class UpdateCompanyDto {
  /**
   * @description Actualización parcial de identidad fiscal.
   */
  @ApiPropertyOptional({
    description: 'Actualización parcial de identidad fiscal',
    type: UpdateFiscalEntityDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateFiscalEntityDto)
  fiscalEntity?: UpdateFiscalEntityDto; // 🚩 Sincronizado: de facturaeParty

  /**
   * @description Dirección fiscal actualizable.
   */
  @ApiPropertyOptional({
    description: 'Actualización parcial de dirección fiscal',
    type: UpdateFiscalAddressDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateFiscalAddressDto)
  fiscalAddress?: UpdateFiscalAddressDto;

  /**
   * @description Email de contacto corporativo. Normalizado a minúsculas con tipado seguro.
   */
  @ApiPropertyOptional({
    description: 'Email de contacto de la empresa',
    example: 'contacto@patrimonio.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El formato del email no es válido' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  email?: string;

  /**
   * @description Teléfono de contacto. Sanitizado con tipado seguro.
   */
  @ApiPropertyOptional({
    description: 'Teléfono de contacto de la empresa',
    example: '+34900000000',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  phone?: string;
}
