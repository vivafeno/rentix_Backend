import { ApiProperty } from '@nestjs/swagger';
import { RoleType } from 'src/user-company-role/entities/user-company-role.entity';

export class CompanyRoleDto {
  @ApiProperty()
  companyId: string;

  @ApiProperty()
  companyName: string;

  @ApiProperty({ enum: RoleType })
  role: RoleType;
}

export class MeDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false, nullable: true })
  globalRole?: string;

  @ApiProperty({ type: [CompanyRoleDto], required: false })
  companyRoles?: CompanyRoleDto[];

  @ApiProperty({ required: false })
  clientProfiles?: any[]; // ⚡ lo afinamos cuando tengas DTOs de ClientProfile

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
