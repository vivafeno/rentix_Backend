import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsEnum,
  IsString,
  MinLength,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

import { AppRole } from 'src/auth/enums/user-global-role.enum';

/**
 * @class CreateUserDto
 * @description Data Transfer Object para la creación de usuarios.
 * Sigue el estándar Blueprint 2026 con tipado estricto y sanitización obligatoria.
 * @version 2026.1.18
 * @author Rentix
 */
export class CreateUserDto {
  /**
   * @description Identificador único de acceso. Normalizado a minúsculas y sin espacios.
   */
  @ApiProperty({
    description: 'Correo electrónico único del usuario',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'El formato del email no es válido' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  ) // 🛡️ Solución: Tipado explícito para eliminar 'unsafe member access'
  email: string;

  /**
   * @description Contraseña de acceso (Hash se genera en el Service).
   */
  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
    example: 'StrongPassword123!',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  /**
   * @description Nombre de pila del usuario.
   */
  @ApiPropertyOptional({
    description: 'Nombre del usuario',
    example: 'Carlos',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  firstName?: string;

  /**
   * @description Apellidos del usuario.
   */
  @ApiPropertyOptional({
    description: 'Apellidos del usuario',
    example: 'Sanz',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  lastName?: string;

  /**
   * @description Teléfono de contacto.
   */
  @ApiPropertyOptional({
    description: 'Teléfono de contacto',
    example: '+34600112233',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  phone?: string;

  /**
   * @description Enlace a la imagen de perfil.
   */
  @ApiPropertyOptional({
    description: 'URL de la foto de perfil',
    example: 'https://cdn.rentix.com/avatars/user-1.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL del avatar no es válida' })
  avatarUrl?: string;

  /**
   * @description Rol de aplicación global.
   */
  @ApiPropertyOptional({
    description: 'Rol global del usuario',
    enum: AppRole,
    example: AppRole.USER,
    default: AppRole.USER,
  })
  @IsOptional()
  @IsEnum(AppRole, { message: 'El rol de aplicación no es válido' })
  appRole?: AppRole;
}
