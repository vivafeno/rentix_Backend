import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * RefreshTokenDto
 *
 * Usado por:
 * POST /auth/refresh
 *
 * Necesario para que Swagger / OpenAPI
 * genere tipos correctos en el frontend
 */
export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  refreshToken: string;
}
