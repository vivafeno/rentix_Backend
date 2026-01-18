import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsOptional,
  IsEmail,
  // 🛡️ IsIBAN eliminado para limpiar el error de 'defined but never used'
  IsEnum,
  MaxLength,
} from 'class-validator';
import { TenantStatus } from '../enums/tenant-status.enum';

/**
 * @class CreateTenantDto
 * @description DTO para la vinculación de arrendatarios.
 * Sincronizado con la lógica de Veri*factu y FacturaE.
 * @version 2026.2.1
 * @author Rentix
 */
export class CreateTenantDto {
  @ApiProperty({
    description: 'ID de la Identidad Fiscal (NIF/CIF)',
    example: 'uuid',
  })
  @IsUUID()
  fiscalIdentityId: string;

  @ApiProperty({ description: 'ID de la Dirección Fiscal', example: 'uuid' })
  @IsUUID()
  direccionFiscalId: string;

  /* --- ATRIBUTOS OPERATIVOS --- */

  @ApiPropertyOptional({
    example: 'TEN-2026-001',
    description: 'Código interno ERP',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  codigoInterno?: string;

  @ApiPropertyOptional({ enum: TenantStatus, default: TenantStatus.ACTIVE })
  @IsOptional()
  @IsEnum(TenantStatus)
  estado?: TenantStatus;

  /* --- CONTACTO & PAGOS --- */

  @ApiPropertyOptional({ example: 'inquilino@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+34600000000' })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({
    description: 'IBAN para domiciliaciones SEPA',
    example: 'ES21...',
  })
  @IsOptional()
  @IsString()
  @MaxLength(34)
  ibanBancario?: string;

  @ApiPropertyOptional({
    description: 'Código residencia AEAT (1: Es, 2: UE, 3: Ext)',
    default: '1',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1)
  codigoResidencia?: string;
}
