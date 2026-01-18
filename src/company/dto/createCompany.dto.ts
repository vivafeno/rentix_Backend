import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsOptional,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

import { CreateFiscalDto } from 'src/fiscal/dto/create-fiscal.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';

/**
 * @class CreateCompanyDto
 * @description DTO para la creación de Empresa/Patrimonio.
 * Permite vinculación por ID o creación anidada (Atomic Creation).
 * Sincronizado con FiscalEntity (v2026.2.0).
 */
export class CreateCompanyDto {
  /* ------------------------------------------------------------------
   * IDENTIDAD FISCAL
   * ------------------------------------------------------------------ */

  @ApiPropertyOptional({
    description: 'ID de la identidad fiscal existente',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  fiscalEntityId?: string; // 🚩 Sincronizado: de facturaePartyId

  @ApiPropertyOptional({
    description: 'Datos para crear una nueva identidad fiscal (Hydrated Draft)',
    type: () => CreateFiscalDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateFiscalDto) // 🚩 Sincronizado: de CreateFiscalEntityDto
  fiscalEntity?: CreateFiscalDto; // 🚩 Sincronizado: de facturaeParty

  /* ------------------------------------------------------------------
   * DIRECCIÓN FISCAL
   * ------------------------------------------------------------------ */

  @ApiPropertyOptional({
    description: 'ID de la dirección física existente',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  fiscalAddressId?: string;

  @ApiPropertyOptional({
    description: 'Datos para crear una nueva dirección (Hydrated Draft)',
    type: () => CreateAddressDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  fiscalAddress?: CreateAddressDto;

  /* ------------------------------------------------------------------
   * VÍNCULO DE PROPIEDAD (OWNER)
   * ------------------------------------------------------------------ */

  /**
   * @description ID del usuario OWNER.
   * Blueprint 2026: Requerido para la transacción atómica inicial.
   */
  @ApiProperty({
    description: 'ID del usuario que será el OWNER del patrimonio',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({
    message: 'El ID del usuario es requerido para el vínculo de propiedad.',
  })
  @IsUUID()
  userId: string;
}
