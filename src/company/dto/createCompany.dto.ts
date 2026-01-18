import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsNotEmpty, 
  IsUUID, 
  IsOptional, 
  ValidateNested, 
  IsObject 
} from 'class-validator';
import { Type } from 'class-transformer';

import { CreateFiscalEntityDto } from 'src/fiscal/dto/create-fiscal.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';

/**
 * @description DTO para la creación de Empresa/Patrimonio.
 * Permite vinculación por ID o creación anidada (Atomic Creation).
 * @version 2026.1.17
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
  facturaePartyId?: string;

  @ApiPropertyOptional({
    description: 'Datos para crear una nueva identidad fiscal (Draft)',
    type: () => CreateFiscalEntityDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateFiscalEntityDto)
  facturaeParty?: CreateFiscalEntityDto;

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
    description: 'Datos para crear una nueva dirección (Draft)',
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
   * Blueprint: Opcional en DTO porque el Backend prioriza el ID del JWT.
   */
  @ApiProperty({
    description: 'ID del usuario que será el OWNER',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'El ID del usuario es requerido para el vínculo inicial' })
  @IsUUID()
  userId: string;
}