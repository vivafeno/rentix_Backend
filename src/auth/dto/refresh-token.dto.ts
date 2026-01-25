import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty } from 'class-validator';

/**
 * @class RefreshTokenDto
 * @description DTO para la rotación de identidad (Blueprint 2026).
 * Valida la integridad estructural del token antes de procesar el refresco de sesión.
 */
export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token JWT emitido por el servidor',
    example: 'eyJhbGciOiJIUzI1NiJ9.payload.signature',
    format: 'JWT',
  })
  @IsJWT({ message: 'El token de refresco no tiene una estructura JWT válida.' })
  @IsNotEmpty({ message: 'El token de refresco es obligatorio.' })
  readonly refreshToken: string; // 🚩 Rigor: Inmutable para proteger la integridad del flujo
}