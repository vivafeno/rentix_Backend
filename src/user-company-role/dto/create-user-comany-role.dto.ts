import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsUUID, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

import { CompanyRole } from 'src/user-company-role/enums/user-company-role.enum';

/**
 * @class CreateUserCompanyRoleDto
 * @description DTO para la formalización del vínculo legal entre un Usuario y un Patrimonio.
 * Implementa la autoridad operativa bajo el paradigma de Tenant Isolation.
 */
export class CreateUserCompanyRoleDto {
  /* --- SUJETO (USUARIO) --- */

  @ApiProperty({
    description: 'UUID del usuario al que se asigna el rol',
    format: 'uuid',
    example: 'aa04f32e-6dba-43af-9363-579e00a53c8b',
  })
  @IsUUID('4')
  @IsNotEmpty()
  userId!: string;

  /* --- CONTEXTO (EMPRESA) --- */

  @ApiProperty({
    description: 'UUID de la empresa donde se asigna el rol',
    format: 'uuid',
    example: 'f54e632a-91be-4bcd-8f40-3ae5cdc3b9e2',
  })
  @IsUUID('4')
  @IsNotEmpty()
  companyId!: string;

  /* --- AUTORIDAD (ROL) --- */

  @ApiProperty({
    description: 'Nivel de autoridad dentro del patrimonio',
    enum: CompanyRole,
    example: CompanyRole.OWNER,
  })
  @IsEnum(CompanyRole)
  @IsNotEmpty()
  role!: CompanyRole;

  /* --- CONFIGURACIÓN DE ACCESO --- */

  @ApiPropertyOptional({
    description: 'Marca esta empresa como la predeterminada al iniciar sesión',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean = false;
}