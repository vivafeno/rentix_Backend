import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppRole } from 'src/auth/enums/user-global-role.enum';
// ⚠️ IMPORTANTE: Usamos el DTO de salida, NO la entidad, para evitar referencias circulares
import { CompanyRoleDto } from '../../user-company-role/dto/company-role.dto';

/**
 * @class UserDto
 * @description Representación pública del usuario.
 * @version 2.1.0 - Rentix 2026 (Full Hydration)
 */
export class UserDto {
  
  @ApiProperty({ example: 'c3f6c9c1-9e9a-4a4b-8f88-3b8b9e7b6c21' })
  id: string;

  @ApiProperty({ example: 'user@rentix.com' })
  email: string;

  /* --- PERFIL --- */

  @ApiPropertyOptional({ example: 'Juan' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Pérez' })
  lastName?: string;

  @ApiPropertyOptional({ example: 'https://cdn.rentix.com/avatars/u1.jpg' })
  avatarUrl?: string;

  /* --- SEGURIDAD & ROLES --- */

  @ApiProperty({ enum: AppRole, example: AppRole.USER })
  appRole: AppRole;

  @ApiProperty({ description: 'Estado operativo del usuario', example: true })
  isActive: boolean;

  /**
   * 🛡️ EL ESLABÓN PERDIDO
   * Esta es la propiedad que faltaba. Sin esto, el selector de empresas del Frontend NO funciona.
   * Usamos type: () => [CompanyRoleDto] para indicar array de objetos complejos.
   */
  @ApiProperty({ 
    description: 'Lista de empresas y roles asignados (Contexto Patrimonial)',
    type: () => [CompanyRoleDto]
  })
  companyRoles: CompanyRoleDto[];
  
  /* --- LOCALIZACIÓN & PREFERENCIAS --- */

  @ApiProperty({ example: 'es', description: 'Idioma preferido para la UI' })
  language: string;

  @ApiProperty({ example: 'Europe/Madrid' })
  timezone: string;

  /* --- ESTADO DE NEGOCIO --- */

  @ApiProperty({ description: 'Paso actual del onboarding (1-10)', example: 1 })
  onboardingStep: number;

  /* --- AUDITORÍA --- */

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;
}