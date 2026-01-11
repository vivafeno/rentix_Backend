import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { CompanyRole } from 'src/user-company-role/enums/companyRole.enum';

/**
 * UpdateUserCompanyRoleDto
 *
 * Contrato para actualizar un vínculo usuario ↔ empresa.
 *
 * ⚠️ Reglas:
 * - SOLO se puede modificar el rol
 * - userId y companyId son inmutables
 */
export class UpdateUserCompanyRoleDto {

  @ApiPropertyOptional({
    description: 'Nuevo rol del usuario dentro de la empresa',
    enum: CompanyRole,
    example: CompanyRole.MANAGER,
  })
  @IsEnum(CompanyRole)
  role?: CompanyRole;
}
