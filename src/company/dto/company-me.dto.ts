import { ApiProperty } from '@nestjs/swagger';

export class CompanyMeDto {
  @ApiProperty({
    format: 'uuid',
    description: 'ID de la empresa',
    example: '8e2c4cae-5a4f-4264-befe-2a406fa4adcb',
  })
  companyId: string;

  @ApiProperty({
    description: 'Nombre legal de la empresa',
    example: 'Empresa Demo SL',
  })
  legalName: string;

  @ApiProperty({
    description: 'Nombre comercial',
    example: 'Demo',
    required: false,
  })
  tradeName?: string;

  @ApiProperty({
    description: 'Rol del usuario dentro de la empresa',
    enum: ['OWNER', 'ADMIN', 'MANAGER', 'VIEWER'],
    example: 'OWNER',
  })
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'VIEWER';
}
