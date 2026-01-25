import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsBoolean, IsString, IsNotEmpty } from 'class-validator';
import { CompanyRole } from '../enums/user-company-role.enum'; // Ajusta la ruta a tu enum

/**
 * @class CompanyRoleDto
 * @description Representación pública del vínculo Usuario-Empresa.
 * Este DTO es vital para que el Frontend sepa a qué empresas puede cambiar el usuario.
 */
export class CompanyRoleDto {
  @ApiProperty({ 
    description: 'ID único del vínculo (UserCompanyRole)', 
    format: 'uuid',
    example: 'aa04f32e-6dba-43af-9363-579e00a53c8b'
  })
  @IsUUID()
  id: string;

  /* 🛡️ PROPIEDAD CLAVE PARA EL FRONTEND */
  @ApiProperty({ 
    description: 'ID de la Empresa vinculada (Vital para el Selector de Contexto)',
    format: 'uuid',
    example: 'f54e632a-91be-4bcd-8f40-3ae5cdc3b9e2'
  })
  @IsUUID()
  companyId: string;

  /* 🛡️ PROPIEDAD CLAVE PARA LA UI */
  @ApiProperty({ 
    description: 'Nombre comercial de la empresa (Para mostrar en el menú)', 
    example: 'Inmobiliaria Rentix S.L.' 
  })
  @IsString()
  companyName: string;

  @ApiProperty({ 
    description: 'Rol ejercido en esta empresa', 
    enum: CompanyRole,
    example: CompanyRole.OWNER 
  })
  @IsEnum(CompanyRole)
  role: CompanyRole;

  @ApiProperty({ 
    description: 'Indica si es la empresa por defecto al hacer login', 
    example: true 
  })
  @IsBoolean()
  isPrimary: boolean;
}