import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * @class LoginDto
 * @description Contrato de acceso primario. 
 * Implementa sanitización de identidad y límites de seguridad para el motor de hashing.
 */
export class LoginDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario (identificador único)',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'El formato del correo electrónico no es válido.' })
  @IsNotEmpty()
  // 🚩 Sanitización: Evita que el login falle por un espacio accidental o mayúsculas.
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  readonly email: string;

  @ApiProperty({
    description: 'Contraseña de acceso',
    example: 'StrongPassword123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  // 🛡️ Protección DoS: Evita ataques de "Long Password" que saturan el CPU al hashear.
  @MaxLength(72, { message: 'La contraseña excede el límite de seguridad permitido.' })
  readonly password: string;
}