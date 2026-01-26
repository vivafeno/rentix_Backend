import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * @class TenantProfileDto
 * @description Contrato de salida para perfiles de cliente (CRM).
 * Blindado para evitar la exposición de companyId y metadatos internos.
 */
export class TenantProfileDto {
  @ApiProperty({ example: 'uuid-v4' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'B12345678', description: 'CIF/NIF legal del cliente' })
  @Expose()
  fiscalId!: string;

  @ApiProperty({ example: 'Inversiones Inmobiliarias S.L.' })
  @Expose()
  name!: string;

  @ApiPropertyOptional({ example: 'contacto@cliente.com' })
  @Expose()
  email?: string;

  @ApiPropertyOptional({ example: 'Calle Mayor 1, Madrid' })
  @Expose()
  address?: string;

  @ApiProperty({ example: true })
  @Expose()
  isActive!: boolean;

  @ApiProperty({ type: 'string', format: 'date-time' })
  @Expose()
  createdAt!: Date;
}