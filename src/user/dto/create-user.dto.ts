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
 * @description Data Transfer Object para la creación de usuarios.
 * Sigue el estándar Blueprint 2026 con tipado estricto, validaciones y sanitización.
 * @version 2026.1.17
 */
export class CreateUserDto {

  /**
   * @description Identificador único de acceso. Normalizado a minúsculas.
   */
  @ApiProperty({
    description: 'Correo electrónico único del usuario',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'El formato del email no es válido' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  /**
   * @description Contraseña de acceso. Se recomienda complejidad alta.
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
   * @description Nombre de pila. Capturado en la hidratación del draft del wizard.
   */
  @ApiPropertyOptional({
    description: 'Nombre del usuario',
    example: 'Carlos',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  firstName?: string;

  /**
   * @description Apellidos. Capturado en la hidratación del draft del wizard.
   */
  @ApiPropertyOptional({
    description: 'Apellidos del usuario',
    example: 'Sanz',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  lastName?: string;

  /**
   * @description Teléfono de contacto en formato internacional.
   */
  @ApiPropertyOptional({
    description: 'Teléfono de contacto',
    example: '+34600112233',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Transform(({ value }) => value?.trim())
  phone?: string;

  /**
   * @description Enlace a la imagen de perfil (S3/Cloudinary/etc).
   */
  @ApiPropertyOptional({
    description: 'URL de la foto de perfil',
    example: 'https://cdn.rentix.com/avatars/user-1.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL del avatar no es válida' })
  avatarUrl?: string;

  /**
   * @description Rol de aplicación. 
   * Nota: El backend sobrescribirá esto a USER si el creador no es SUPERADMIN.
   */
  @ApiPropertyOptional({
    description: 'Rol global del usuario dentro del sistema',
    enum: AppRole,
    example: AppRole.USER,
    default: AppRole.USER,
  })
  @IsOptional()
  @IsEnum(AppRole, { message: 'El rol de aplicación no es válido' })
  appRole?: AppRole;
}