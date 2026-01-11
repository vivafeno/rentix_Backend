import { ApiProperty } from '@nestjs/swagger';
import { CompanyRole } from 'src/user-company-role/enums/userCompanyRole.enum';

export class CompanyMeDto {
  @ApiProperty({
    format: 'uuid',
    description: 'ID de la empresa',
  })
  companyId: string;

  @ApiProperty({
    description: 'Nombre legal de la empresa',
    example: 'Empresa Demo SL',
  })
  legalName: string;

  @ApiProperty({
    description: 'Nombre comercial',
    required: false,
    nullable: true,
  })
  tradeName?: string;

  @ApiProperty({
    description: 'Identificación fiscal',
    example: 'B12345678',
  })
  taxId: string;

  @ApiProperty({
    description: 'Email del usuario OWNER',
    example: 'owner@empresa.com',
  })
  ownerEmail: string;

  @ApiProperty({
    description: 'Rol del usuario autenticado en la empresa',
    enum: CompanyRole,
  })
  role: CompanyRole;
}
