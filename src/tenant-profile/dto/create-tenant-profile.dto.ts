import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  IsArray,
  MaxLength,
} from 'class-validator';

import { CreateFiscalDto } from '../../fiscal/dto/create-fiscal.dto';
import { CreateAddressDto } from '../../address/dto/create-address.dto';

/**
 * @class CreateTenantProfileDto
 * @description Orquestador de la capa operativa. 
 * Maneja CRM, Finanzas y Estructuras Anidadas.
 */
export class CreateTenantProfileDto {
  /* --- ⚙️ DATOS CRM --- */
  
  @ApiPropertyOptional({ example: 'CLI-001' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  internalCode?: string;

  @ApiPropertyOptional({ example: 'facturacion@arrendatario.es' })
  @IsOptional()
  @IsEmail({}, { message: 'El formato del email de facturación es incorrecto' })
  billingEmail?: string;

  @ApiPropertyOptional({ example: '+34 600 000 000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Cliente preferente' })
  @IsOptional()
  @IsString()
  notes?: string;

  /* --- 💰 FINANZAS & SEPA (Sincronizado con Entity) --- */

  @ApiPropertyOptional({ 
    example: 'ES2100001234567890123456',
    description: 'IBAN para domiciliaciones bancarias'
  })
  @IsOptional()
  @IsString()
  @MaxLength(34)
  bankIban?: string;

  @ApiPropertyOptional({ example: 'TRANSFERENCIA' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  paymentDays?: number;

  @ApiPropertyOptional({ 
    description: '1=ES, 2=UE, 3=EXT',
    example: '1' 
  })
  @IsOptional()
  @IsString()
  @MaxLength(1)
  taxResidenceCode?: string;

  /* --- 🏗️ ESTRUCTURAS ANIDADAS --- */

  @ApiProperty({
    description: 'Datos Fiscales (NIF, Razón Social)',
    type: () => CreateFiscalDto,
  })
  @ValidateNested()
  @Type(() => CreateFiscalDto)
  fiscalIdentity: CreateFiscalDto;

  @ApiProperty({
    description: 'Array de direcciones (Fiscal, Envío, Notificaciones)',
    type: [CreateAddressDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAddressDto)
  addresses: CreateAddressDto[];
}