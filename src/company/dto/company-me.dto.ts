import { ApiProperty } from '@nestjs/swagger';
import { CompanyRole } from 'src/user-company-role/enums/userCompanyRole.enum';

/**
 * CompanyMeDto
 *
 * Empresa asociada al usuario autenticado junto con su rol.
 *
 * Usado en:
 * - GET /companies/me
 */
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
    description: 'Nombre comercial de la empresa',
    example: 'Demo',
    required: false,
    nullable: true,
  })
  tradeName?: string;

  @ApiProperty({
    description: 'Rol del usuario dentro de la empresa',
    enum: CompanyRole,
    example: CompanyRole.OWNER,
  })
  role: CompanyRole;
}
