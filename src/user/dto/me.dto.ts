import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyRole } from 'src/user-company-role/enums/companyRole.enum';
import { AppRole } from 'src/auth/enums/user-global-role.enum';

/**
 * DTO que representa el rol de un usuario dentro de una empresa.
 */
export class CompanyRoleDto {
  @ApiProperty({
    description: 'Identificador único de la empresa vinculada',
    example: 'f2383490-f2b0-4d09-b74b-717ef4dfbcf4',
    format: 'uuid',
  })
  companyId: string;

  @ApiProperty({
    description: 'Nombre comercial o legal de la empresa para mostrar en el selector del Front',
    example: 'Rentix SL',
  })
  companyName: string;

  @ApiProperty({
    description: 'Nivel de permisos del usuario dentro de esta empresa específica',
    enum: CompanyRole,
    example: CompanyRole.OWNER,
  })
  role: CompanyRole;
}

/**
 * DTO del endpoint /users/me
 * Proporciona el contexto completo del usuario para inicializar la App (Angular).
 */
export class MeDto {
  @ApiProperty({
    description: 'ID único del usuario (UUID)',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Correo electrónico principal utilizado para login y notificaciones',
    example: 'user@rentix.app',
  })
  email: string;

  @ApiPropertyOptional({ 
    description: 'Nombre de pila del usuario (procedente del perfil)',
    example: 'System' 
  })
  firstName?: string;

  @ApiPropertyOptional({ 
    description: 'Apellidos del usuario',
    example: 'Admin' 
  })
  lastName?: string;

  @ApiProperty({
    description: 'Rol administrativo global que determina el acceso a funciones maestras de la App',
    enum: AppRole,
    example: AppRole.SUPERADMIN,
  })
  appRole: AppRole;

  @ApiProperty({
    description: 'Listado de empresas en las que el usuario participa y su rol en cada una',
    type: [CompanyRoleDto],
  })
  companyRoles: CompanyRoleDto[];

  @ApiPropertyOptional({
    description: 'Perfiles adicionales de cliente si el usuario actúa como tal',
    type: 'array',
    items: { type: 'object' },
  })
  clientProfiles?: Record<string, any>[];

  @ApiProperty({
    description: 'Estado de habilitación de la cuenta en el sistema',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Timestamp de creación del usuario',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp de la última modificación de los datos del usuario',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}