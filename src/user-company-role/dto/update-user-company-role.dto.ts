import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsBoolean } from 'class-validator';

import { CompanyRole } from 'src/user-company-role/enums/user-company-role.enum';

/**
 * @class UpdateUserCompanyRoleDto
 * @description DTO para la modificación de autoridad y preferencias en un vínculo patrimonial.
 * Rigor 2026: Prohíbe la mutación de identidades, solo permite cambio de privilegios.
 */
export class UpdateUserCompanyRoleDto {
  
  /**
   * @description Nuevo nivel de privilegio.
   * La transición (ej. de VIEWER a OWNER) requiere validación jerárquica en el Service.
   */
  @ApiPropertyOptional({
    description: 'Nuevo rol de autoridad dentro de la empresa',
    enum: CompanyRole,
    example: CompanyRole.TENANT,
  })
  @IsEnum(CompanyRole)
  @IsOptional()
  role?: CompanyRole;

  /**
   * @description Define si esta empresa debe ser la principal para el usuario.
   */
  @ApiPropertyOptional({
    description: 'Establecer como empresa predeterminada en el login',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}