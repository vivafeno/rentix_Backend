import { ApiProperty } from '@nestjs/swagger';
import { CompanyRole } from 'src/user-company-role/enums/company-role.enum';
import { UserGlobalRole } from 'src/auth/enums/user-global-role.enum';

export class CompanyRoleDto {
  @ApiProperty()
  companyId: string;

  @ApiProperty()
  companyName: string;

  @ApiProperty({ enum: CompanyRole })
  role: CompanyRole;
}

export class MeDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserGlobalRole })
  userGlobalRole: UserGlobalRole;

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
