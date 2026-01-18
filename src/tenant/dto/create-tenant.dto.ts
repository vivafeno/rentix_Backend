import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, IsEnum } from 'class-validator';
import { TenantStatus } from '../enums/tenant-status.enum';

/**
 * Data Transfer Object para la creación de un Arrendatario.
 * Basado en la vinculación de identidades fiscales y direcciones existentes.
 * * @author Gemini Blueprint 2026
 */
export class CreateTenantDto {

  /** ID de la empresa que gestiona y es propietaria del registro */
  @ApiProperty({
    description: 'ID de la empresa propietaria (Tenant Isolation)',
    example: 'f2a1e0d9-4c6a-4d1e-9b3a-1c2d3e4f5678',
    format: 'uuid'
  })
  @IsUUID()
  companyId: string;

  /** ID de la Identidad Fiscal (Facturae) ya creada */
  @ApiProperty({
    description: 'ID de la Identidad Fiscal legal asociada (Módulo Facturae)',
    example: 'c1b2a3d4-1111-4aaa-9bbb-ccccdddd0000',
    format: 'uuid'
  })
  @IsUUID()
  fiscalIdentityId: string;

  /** Código interno administrativo */
  @ApiProperty({ 
    example: 'TEN-2026-001', 
    required: false,
    description: 'Código de referencia interno para el ERP'
  })
  @IsString()
  @IsOptional()
  internalCode?: string;

  /** Estado inicial del arrendatario */
  @ApiProperty({ 
    enum: TenantStatus, 
    default: TenantStatus.ACTIVE 
  })
  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus = TenantStatus.ACTIVE;

  /** Email de contacto para el módulo de notificaciones */
  @ApiProperty({ example: 'arrendatario@email.com' })
  @IsString()
  @IsOptional()
  email?: string;
}