import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { CompanyRole } from 'src/user-company-role/enums/companyRole.enum';

/**
 * @class UpdateUserCompanyRoleDto
 * @description DTO para la modificación de autoridad en un vínculo patrimonial existente.
 * Mantiene la integridad referencial al prohibir la mutación de userId o companyId.
 * @version 2026.2.0
 */
export class UpdateUserCompanyRoleDto {

  /**
   * @description Nuevo nivel de privilegio a asignar.
   * La transición entre roles (ej. de VIEWER a OWNER) debe estar validada por un ADMIN/SUPERADMIN.
   */
  @ApiPropertyOptional({
    description: 'Nuevo rol de autoridad dentro de la empresa',
    enum: CompanyRole,
    enumName: 'CompanyRole',
    example: CompanyRole.TENANT,
  })
  @IsEnum(CompanyRole)
  @IsOptional()
  role?: CompanyRole;
}