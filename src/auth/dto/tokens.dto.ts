import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO que representa el par de tokens JWT
 * devueltos tras autenticación o refresh.
 */
export class TokensDto {
  @ApiProperty({
    description: 'Access token JWT utilizado para autenticar las peticiones',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: 'string',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token JWT utilizado para renovar el access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: 'string',
  })
  refreshToken: string;
}
