import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

/**
 * @class UpdateUserDto
 * @description DTO restrictivo para la actualización de perfil de usuario.
 * Excluye campos sensibles que requieren flujos de validación específicos (Email/Password).
 */
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, [
    'email', 
    'password', 
    'appRole', 
    'acceptTerms'
  ] as const),
) {
  
  /* --- CAMPOS ADICIONALES DE ACTUALIZACIÓN --- */

  @ApiPropertyOptional({ 
    description: 'Paso actual del wizard de configuración',
    example: 2 
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  onboardingStep?: number;

  @ApiPropertyOptional({ 
    description: 'Estado de actividad operativa del usuario',
    example: true 
  })
  @IsOptional()
  isActive?: boolean;
}