import {
    IsEmail, IsEnum, IsOptional,  IsString, IsUUID, MinLength
} from 'class-validator'
import { RoleType } from '../entities/user-company-role.entity';

export class CreateUserCompanyRoleDto {

    @IsUUID()
    userId: string;

    @IsUUID()
    companyId: string;

    @IsEnum(RoleType)
    role: RoleType;
    

}
