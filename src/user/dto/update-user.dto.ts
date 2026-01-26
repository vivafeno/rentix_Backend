import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

/**
 * @class UpdateUserDto
 * @description DTO restrictivo para la actualización de perfil.
 * Protege la integridad de la cuenta excluyendo credenciales y términos legales.
 * @version 2.1.0
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

  /**
   * @description Controla el progreso del usuario en la plataforma.
   * Útil para que los Guards del Frontend redirijan al Dashboard o al Wizard.
   */
  @ApiPropertyOptional({ 
    description: 'Paso actual del wizard de configuración (1-10)',
    example: 2 
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  onboardingStep?: number;

  /**
   * @description Permite la deshabilitación administrativa del perfil.
   */
  @ApiPropertyOptional({ 
    description: 'Estado de actividad operativa del usuario',
    example: true 
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado de actividad debe ser un valor booleano' })
  isActive?: boolean;
}