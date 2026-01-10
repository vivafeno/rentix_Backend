import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';

import { CompanyRole } from 'src/user-company-role/enums/userCompanyRole.enum';

/**
 * CreateUserCompanyRoleDto
 *
 * Contrato para crear un vínculo usuario ↔ empresa con un rol.
 *
 * Usado en:
 * - POST /user-company-role
 *
 * ⚠️ Nota:
 * - userId y companyId son UUIDs, no objetos.
 * - Las relaciones se resuelven en el service.
 */
export class CreateUserCompanyRoleDto {

  /* ------------------------------------------------------------------
   * USUARIO
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'UUID del usuario al que se asigna el rol',
    format: 'uuid',
    example: 'aa04f32e-6dba-43af-9363-579e00a53c8b',
  })
  @IsUUID('4')
  userId: string;

  /* ------------------------------------------------------------------
   * EMPRESA
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'UUID de la empresa donde se asigna el rol',
    format: 'uuid',
    example: 'f54e632a-91be-4bcd-8f40-3ae5cdc3b9e2',
  })
  @IsUUID('4')
  companyId: string;

  /* ------------------------------------------------------------------
   * ROL
   * ------------------------------------------------------------------ */

  @ApiProperty({
    description: 'Rol del usuario dentro de la empresa',
    enum: CompanyRole,
    example: CompanyRole.OWNER,
  })
  @IsEnum(CompanyRole)
  role: CompanyRole;
}
