import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AppRole } from 'src/auth/enums/user-global-role.enum';
import { CompanyRoleDto } from '../../user-company-role/dto/company-role.dto';

/**
 * @class UserDto
 * @description Contrato de salida para la identidad del usuario. 
 * Implementa una "Whitelist" estricta mediante @Expose para evitar fugas de PII (Personally Identifiable Information).
 */
export class UserDto {
  @ApiProperty({ example: 'c3f6c9c1-9e9a-4a4b-8f88-3b8b9e7b6c21', description: 'Identificador único UUID v4' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'user@rentix.com', description: 'Correo electrónico verificado' })
  @Expose()
  email!: string;

  @ApiPropertyOptional({ example: 'Juan', description: 'Nombre de pila del usuario' })
  @Expose()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Pérez', description: 'Apellidos completos' })
  @Expose()
  lastName?: string;

  @ApiProperty({ enum: AppRole, example: AppRole.USER, description: 'Rol administrativo global en la plataforma' })
  @Expose()
  appRole!: AppRole;

  @ApiProperty({ example: true, description: 'Define si el usuario puede realizar login y operar' })
  @Expose()
  isActive!: boolean;

  @ApiPropertyOptional({ type: 'string', format: 'date-time', description: 'Fecha de consentimiento de términos legales' })
  @Expose()
  acceptedTermsAt?: Date;

  @ApiProperty({ 
    type: () => [CompanyRoleDto], 
    description: 'Matriz de permisos vinculada a empresas (Multi-tenancy)' 
  })
  @Expose()
  @Type(() => CompanyRoleDto)
  companyRoles!: CompanyRoleDto[];

  @ApiProperty({ type: 'string', format: 'date-time', description: 'Fecha de registro inicial' })
  @Expose()
  createdAt!: Date;
}