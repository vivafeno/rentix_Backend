import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, ValidateNested, IsEmail, IsString, MaxLength } from 'class-validator';
import { Type, Transform } from 'class-transformer';

import { CreateFiscalEntityDto } from '../../fiscal/dto/create-fiscal.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';

/**
 * @description DTO parcial para la actualización de la Identidad Fiscal.
 * Hereda todas las validaciones de CreateFiscalIdentityDto pero las hace opcionales.
 */
export class UpdateFacturaePartyDto extends PartialType(CreateFiscalEntityDto) {}

/**
 * @description DTO parcial para la actualización de la Dirección Fiscal.
 * Hereda todas las validaciones de CreateAddressDto pero las hace opcionales.
 */
export class UpdateFiscalAddressDto extends PartialType(CreateAddressDto) {}

/**
 * @description DTO para la actualización de Empresa/Patrimonio.
 * Permite edición parcial y anidada siguiendo el estándar Blueprint 2026.
 * @version 2026.1.17
 */
export class UpdateCompanyDto {

  /**
   * @description Datos fiscales actualizables. 
   * Nota: El taxId (CIF/NIF) suele marcarse como readonly en el servicio si ya hay facturas.
   */
  @ApiPropertyOptional({
    description: 'Actualización parcial de identidad fiscal',
    type: UpdateFacturaePartyDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateFacturaePartyDto)
  facturaeParty?: UpdateFacturaePartyDto;

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
   * @description Email de contacto corporativo. Normalizado a minúsculas.
   */
  @ApiPropertyOptional({
    description: 'Email de contacto de la empresa',
    example: 'contacto@patrimonio.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El formato del email de contacto no es válido' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  /**
   * @description Teléfono de contacto. Sanitizado (trim).
   */
  @ApiPropertyOptional({
    description: 'Teléfono de contacto de la empresa',
    example: '+34900000000',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Transform(({ value }) => value?.trim())
  phone?: string;
}