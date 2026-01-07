import { PartialType } from '@nestjs/swagger';
import { CreateUserCompanyRoleDto } from './createUuserCompanyRole.dto';

export class UpdateUserCompanyRoleDto extends PartialType(CreateUserCompanyRoleDto) {}
