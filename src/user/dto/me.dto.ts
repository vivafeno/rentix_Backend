import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyRole } from 'src/user-company-role/enums/userCompanyRole.enum';
import { UserGlobalRole } from 'src/auth/enums/user-global-role.enum';

/**
 * DTO que representa el rol de un usuario dentro de una empresa.
 */
export class CompanyRoleDto {

  @ApiProperty({
    description: 'ID de la empresa',
    format: 'uuid',
  })
  companyId: string;

  @ApiProperty({
    description: 'Nombre de la empresa',
    example: 'Rentix SL',
  })
  companyName: string;

  @ApiProperty({
    description: 'Rol del usuario dentro de la empresa',
    enum: CompanyRole,
    example: CompanyRole.OWNER,
  })
  role: CompanyRole;
}

/**
 * DTO del endpoint /user/me
 * Representa al usuario autenticado y su contexto.
 */
export class MeDto {

  @ApiProperty({
    description: 'ID del usuario',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'user@rentix.app',
  })
  email: string;

  @ApiProperty({
    description: 'Rol global del usuario dentro del sistema',
    enum: UserGlobalRole,
    example: UserGlobalRole.USER,
  })
  userGlobalRole: UserGlobalRole;

  @ApiPropertyOptional({
    description: 'Roles del usuario en las distintas empresas',
    type: () => CompanyRoleDto,
    isArray: true,
  })
  companyRoles?: CompanyRoleDto[];

  @ApiPropertyOptional({
    description: 'Perfiles de cliente asociados al usuario',
    type: 'array',
    items: { type: 'object' },
  })
  clientProfiles?: Record<string, any>[];

  @ApiProperty({
    description: 'Indica si el usuario está activo',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Fecha de creación del usuario',
    type: 'string',
    format: 'date-time',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del usuario',
    type: 'string',
    format: 'date-time',
  })
  updated_at: Date;
}
