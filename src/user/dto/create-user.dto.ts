import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsEnum,
  IsString,
  MinLength,
} from 'class-validator';

import { AppRole } from 'src/auth/enums/user-global-role.enum';

/**
 * DTO para la creación de usuarios.
 * Define el contrato OpenAPI para el alta de usuarios.
 */
export class CreateUserDto {

  @ApiProperty({
    description: 'Correo electrónico único del usuario',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
    example: 'StrongPassword123!',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    description: 'Rol global del usuario dentro del sistema',
    enum: AppRole,
    example: AppRole.USER,
    default: AppRole.USER,
  })
  @IsOptional()
  @IsEnum(AppRole)
  appRole?: AppRole;
}
