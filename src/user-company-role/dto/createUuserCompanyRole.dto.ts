import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';

import { CompanyRole } from 'src/user-company-role/enums/userCompanyRole.enum';

/**
 * CreateUserCompanyRoleDto
 *
 * Contrato para crear un vínculo usuario ↔ empresa con un rol
 *
 * Usado por:
 * - POST /user-company-role
 */
export class CreateUserCompanyRoleDto {

  @ApiProperty({
    description: 'UUID del usuario al que se asigna el rol',
    format: 'uuid',
    example: 'aa04f32e-6dba-43af-9363-579e00a53c8b',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'UUID de la empresa donde se asigna el rol',
    format: 'uuid',
    example: 'f54e632a-91be-4bcd-8f40-3ae5cdc3b9e2',
  })
  @IsUUID()
  companyId: string;

  @ApiProperty({
    description: 'Rol del usuario dentro de la empresa',
    enum: CompanyRole,
    example: CompanyRole.OWNER,
  })
  @IsEnum(CompanyRole)
  role: CompanyRole;
}
