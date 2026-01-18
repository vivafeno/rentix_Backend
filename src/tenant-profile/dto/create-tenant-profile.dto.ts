import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import { CreateFiscalDto } from '../../fiscal/dto/create-fiscal.dto';
import { CreateAddressDto } from '../../address/dto/create-address.dto';

/**
 * @class CreateTenantProfileDto
 * @description DTO Maestro para la creación de perfiles CRM de clientes.
 * Orquesta la validación de datos administrativos, fiscales y postales.
 * @version 2026.1.19
 */
export class CreateTenantProfileDto {
  /* ------------------------------------------------------------------
   * ⚙️ DATOS CRM (Gestión)
   * ------------------------------------------------------------------ */

  @ApiPropertyOptional({
    description: 'Código interno administrativo (ej: CLI-2024-001).',
    example: 'CLI-001',
  })
  @IsOptional()
  @IsString()
  internalCode?: string;

  @ApiPropertyOptional({
    description: 'Email de facturación (Veri*factu compliant).',
    example: 'facturacion@cliente.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El formato del email de facturación no es válido.' })
  billingEmail?: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto administrativo.',
    example: '+34 600 000 000',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Observaciones internas del cliente.',
    example: 'Llamar solo por las tardes.',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  /* ------------------------------------------------------------------
   * 💰 CONDICIONES DE PAGO
   * ------------------------------------------------------------------ */

  @ApiPropertyOptional({
    description: 'Método de pago habitual (TRANSFERENCIA, RECIBO, etc).',
    example: 'TRANSFERENCIA',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({
    description: 'Días de vencimiento (0 = Contado).',
    default: 0,
    example: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  paymentDays?: number;

  /* ------------------------------------------------------------------
   * 🏗️ ESTRUCTURAS ANIDADAS (Relaciones)
   * ------------------------------------------------------------------ */

  /**
   * @description Datos de identidad fiscal.
   * Resuelve el error de linter asegurando que el tipo es una clase constructora.
   */
  @ApiProperty({
    description: 'Datos Fiscales (NIF, Razón Social) para Facturae',
    type: () => CreateFiscalDto,
  })
  @ValidateNested()
  @Type((): typeof CreateFiscalDto => CreateFiscalDto) // 🚩 Solución linter: Tipado explícito del retorno
  fiscalIdentity: CreateFiscalDto;

  @ApiProperty({
    description: 'Dirección Fiscal Principal',
    type: () => CreateAddressDto,
  })
  @ValidateNested()
  @Type((): typeof CreateAddressDto => CreateAddressDto) // 🚩 Solución linter: Tipado explícito del retorno
  address: CreateAddressDto;
}
