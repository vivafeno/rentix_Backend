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
 * @description DTO parcial para la Identidad Fiscal.
 */
export class UpdateFiscalEntityDto extends PartialType(CreateFiscalDto) {}

/**
 * @class UpdateFiscalAddressDto
 * @description DTO parcial para la Dirección Fiscal.
 */
export class UpdateFiscalAddressDto extends PartialType(CreateAddressDto) {}

/**
 * @class UpdateCompanyDto
 * @description DTO para la actualización de Empresa/Patrimonio.
 * Soporta actualización anidada (Deep Save) de datos fiscales y dirección.
 * @version 2026.2.1
 */
export class UpdateCompanyDto {
  
  @ApiPropertyOptional({
    description: 'Actualización parcial de identidad fiscal',
    type: UpdateFiscalEntityDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateFiscalEntityDto)
  fiscalEntity?: UpdateFiscalEntityDto;

  @ApiPropertyOptional({
    description: 'Actualización parcial de dirección fiscal',
    type: UpdateFiscalAddressDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateFiscalAddressDto)
  fiscalAddress?: UpdateFiscalAddressDto;

  @ApiPropertyOptional({
    description: 'Email de contacto de la empresa',
    example: 'contacto@patrimonio.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El formato del email no es válido' })
  @Transform(({ value }: { value: any }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  email?: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto de la empresa',
    example: '+34900000000',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Transform(({ value }: { value: any }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  phone?: string;

  /**
   * Nota para el Superadmin: isActive y deletedAt no están aquí.
   * Se gestionan mediante el endpoint toggleStatus por seguridad operativa.
   */
}