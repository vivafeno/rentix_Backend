import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyRole } from 'src/user-company-role/enums/companyRole.enum';

/**
 * @description DTO de salida para el contexto del usuario actual.
 * Proporciona información resumida de la empresa y el rol para el estado global del Frontend.
 * @version 2026.1.17
 */
export class CompanyMeDto {
  /**
   * @description Identificador único de la empresa/patrimonio.
   */
  @ApiProperty({
    format: 'uuid',
    description: 'ID de la empresa',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  companyId: string;

  /**
   * @description Razón social extraída de FiscalIdentity.
   */
  @ApiProperty({
    description: 'Nombre legal de la empresa (Razón Social)',
    example: 'Juan Pérez Patrimonial SL',
  })
  legalName: string;

  /**
   * @description Nombre comercial para visualización en el dashboard.
   */
  @ApiPropertyOptional({
    description: 'Nombre comercial del patrimonio',
    example: 'Alquileres Familia Sanz',
    nullable: true,
  })
  tradeName?: string;

  /**
   * @description CIF/NIF/DNI asociado al patrimonio.
   */
  @ApiProperty({
    description: 'Identificación fiscal (CIF/NIF)',
    example: '12345678Z',
  })
  taxId: string;

  /**
   * @description Email del propietario (OWNER) para contacto administrativo.
   */
  @ApiProperty({
    description: 'Email del usuario que ostenta la titularidad (OWNER)',
    example: 'propietario@rentix.com',
  })
  ownerEmail: string;

  /**
   * @description Rol contextual del usuario que realiza la petición.
   * Blueprint 2026: Crítico para el filtrado de menús en el Frontend.
   */
  @ApiProperty({
    description: 'Rol del usuario autenticado en este contexto específico',
    enum: CompanyRole,
    example: CompanyRole.OWNER,
  })
  role: CompanyRole;
}
