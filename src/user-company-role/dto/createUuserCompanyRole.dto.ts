import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID, IsNotEmpty } from 'class-validator';

import { CompanyRole } from 'src/user-company-role/enums/companyRole.enum';

/**
 * @class CreateUserCompanyRoleDto
 * @description DTO para la formalización del vínculo legal entre un Usuario y un Patrimonio.
 * Define la autoridad operativa dentro del contexto de Tenant Isolation.
 * @version 2026.2.0
 */
export class CreateUserCompanyRoleDto {
  /* ------------------------------------------------------------------
   * SUJETO (USUARIO)
   * ------------------------------------------------------------------ */

  /**
   * @description Identificador único del usuario.
   * Debe existir previamente en la tabla de identidades globales.
   */
  @ApiProperty({
    description: 'UUID del usuario al que se asigna el rol',
    format: 'uuid',
    example: 'aa04f32e-6dba-43af-9363-579e00a53c8b',
  })
  @IsUUID('4')
  @IsNotEmpty()
  userId: string;

  /* ------------------------------------------------------------------
   * CONTEXTO (EMPRESA)
   * ------------------------------------------------------------------ */

  /**
   * @description Identificador único del patrimonio.
   * Determina el ámbito de visibilidad de direcciones y facturas Veri*factu.
   */
  @ApiProperty({
    description: 'UUID de la empresa donde se asigna el rol',
    format: 'uuid',
    example: 'f54e632a-91be-4bcd-8f40-3ae5cdc3b9e2',
  })
  @IsUUID('4')
  @IsNotEmpty()
  companyId: string;

  /* ------------------------------------------------------------------
   * AUTORIDAD (ROL)
   * ------------------------------------------------------------------ */

  /**
   * @description Nivel de privilegio (OWNER, TENANT, VIEWER).
   * Crucial para el Blindaje Total: el service validará que no existan duplicados.
   */
  @ApiProperty({
    description: 'Rol de autoridad dentro del patrimonio',
    enum: CompanyRole,
    enumName: 'CompanyRole',
    example: CompanyRole.OWNER,
  })
  @IsEnum(CompanyRole)
  @IsNotEmpty()
  role: CompanyRole;
}
