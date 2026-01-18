import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * DTO para el login de usuario.
 * Define el contrato OpenAPI del endpoint de autenticación.
 */
export class LoginDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'user@example.com',
    format: 'email',
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
}
