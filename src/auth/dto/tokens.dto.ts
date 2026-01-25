import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty } from 'class-validator';

/**
 * @class TokensDto
 * @description Par de tokens criptográficos para la gestión de sesiones.
 * Implementa el estándar de rotación de tokens (Access/Refresh).
 */
export class TokensDto {
  @ApiProperty({
    description: 'Token de acceso de corta duración (Bearer)',
    example: 'eyJhbGciOiJIUzI1NiJ9.payload.signature',
  })
  @IsJWT()
  @IsNotEmpty()
  readonly accessToken: string;

  @ApiProperty({
    description: 'Token de refresco de larga duración para rotación de sesión',
    example: 'eyJhbGciOiJIUzI1NiJ9.payload.signature',
  })
  @IsJWT()
  @IsNotEmpty()
  readonly refreshToken: string;

  @ApiProperty({
    description: 'Tipo de token emitido',
    example: 'Bearer',
    default: 'Bearer',
  })
  readonly tokenType: string = 'Bearer';
}