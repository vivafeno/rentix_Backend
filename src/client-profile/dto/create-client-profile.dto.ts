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

// Importamos los DTOs de los otros módulos
import { CreateFiscalIdentityDto } from '../../facturae/dto/create-fiscalIdentity.dto';
import { CreateAddressDto } from '../../address/dto/create-address.dto';

export class CreateClientProfileDto {
  /* ------------------------------------------------------------------
   * ⚙️ DATOS CRM (Gestión)
   * ------------------------------------------------------------------ */

  @ApiPropertyOptional({
    description: 'Código interno (ej: CLI-2024-001). Si se omite, se autogenera.',
    example: 'CLI-001',
  })
  @IsOptional()
  @IsString()
  internalCode?: string;

  @ApiPropertyOptional({
    description: 'Email específico para facturas (si es distinto al de contacto)',
    example: 'facturacion@cliente.com',
  })
  @IsOptional()
  @IsEmail()
  billingEmail?: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto administrativo',
    example: '+34 600 000 000',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Notas internas o observaciones sobre el cliente',
    example: 'Llamar solo por las tardes. Cliente VIP.',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  /* ------------------------------------------------------------------
   * 💰 CONDICIONES DE PAGO
   * ------------------------------------------------------------------ */

  @ApiPropertyOptional({
    description: 'Método de pago habitual',
    example: 'TRANSFERENCIA',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({
    description: 'Días de vencimiento de facturas (0 = Contado)',
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

  @ApiProperty({
    description: 'Datos Fiscales (NIF, Razón Social) para Facturae',
    type: CreateFiscalIdentityDto,
  })
  @ValidateNested()
  @Type(() => CreateFiscalIdentityDto)
  fiscalIdentity: CreateFiscalIdentityDto;

  @ApiProperty({
    description: 'Dirección Fiscal Principal',
    type: CreateAddressDto,
  })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;
}