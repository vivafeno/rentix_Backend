import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { RoleType } from '../entities/user-company-role.entity';

export class CreateUserCompanyRoleDto {
  @ApiProperty({
    description: 'UUID del usuario que tendrá el rol asignado',
    example: 'aa04f32e-6dba-43af-9363-579e00a53c8b'
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'UUID de la empresa donde se asigna el rol',
    example: 'f54e632a-91be-4bcd-8f40-3ae5cdc3b9e2'
  })
  @IsUUID()
  companyId: string;

  @ApiProperty({
    enum: RoleType,
    example: RoleType.OWNER,
    description: 'Tipo de rol dentro de la empresa: owner, manager, client, etc.'
  })
  @IsEnum(RoleType)
  role: RoleType;
}
