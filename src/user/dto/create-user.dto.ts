import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsEnum,
  IsString,
  MinLength,
  IsUrl,
  MaxLength,
  IsBoolean,
  IsNotEmpty,
  Equals,
} from 'class-validator';
import { Transform } from 'class-transformer';

import { AppRole } from 'src/auth/enums/user-global-role.enum';

/**
 * @class CreateUserDto
 * @description DTO de alta de usuarios Rentix 2026.
 * Incluye localización, cumplimiento legal (RGPD) y sanitización estricta.
 */
export class CreateUserDto {

  /* --- 🔐 CREDENCIALES --- */

  @ApiProperty({ example: 'user@example.com', description: 'Email único del usuario' })
  @IsEmail({}, { message: 'El formato del email no es válido' })
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  email: string;

  @ApiProperty({ example: 'StrongPassword123!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'La seguridad Rentix requiere al menos 8 caracteres' })
  password: string;

  /* --- 👤 DATOS PERSONALES --- */

  @ApiPropertyOptional({ example: 'Carlos' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  firstName?: string;

  @ApiPropertyOptional({ example: 'Sanz' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  lastName?: string;

  @ApiPropertyOptional({ example: '+34600112233' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/\s/g, '') : value)) // Quita espacios en teléfonos
  phone?: string;

  @ApiPropertyOptional({ example: 'https://cdn.rentix.com/avatars/u1.jpg' })
  @IsOptional()
  @IsUrl({}, { message: 'La URL del avatar no es válida' })
  avatarUrl?: string;

  /* --- 🌍 LOCALIZACIÓN (Rigor 2026) --- */

  @ApiPropertyOptional({ example: 'es', default: 'es' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  language?: string = 'es';

  @ApiPropertyOptional({ example: 'Europe/Madrid', default: 'Europe/Madrid' })
  @IsOptional()
  @IsString()
  timezone?: string = 'Europe/Madrid';

  /* --- ⚖️ CUMPLIMIENTO LEGAL (RGPD) --- */

  @ApiProperty({ description: 'Aceptación obligatoria de términos y condiciones' })
  @IsBoolean({ message: 'El campo de términos debe ser un valor booleano' })
  @Equals(true, { message: 'Debes aceptar los términos y condiciones para continuar' }) // 🚩 Rigor: Bloqueo si es false
  @IsNotEmpty()
  acceptTerms: boolean;

  /* --- 🛡️ SEGURIDAD --- */

  @ApiPropertyOptional({ enum: AppRole, default: AppRole.USER })
  @IsOptional()
  @IsEnum(AppRole)
  appRole?: AppRole = AppRole.USER;
}