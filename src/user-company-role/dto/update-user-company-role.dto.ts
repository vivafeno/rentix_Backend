import { PartialType } from '@nestjs/swagger';
import { CreateUserCompanyRoleDto } from './create-user-company-role.dto';

export class UpdateUserCompanyRoleDto extends PartialType(CreateUserCompanyRoleDto) {}
