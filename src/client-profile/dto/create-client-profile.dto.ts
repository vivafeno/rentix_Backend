import {
    IsEmail, IsOptional,  IsString, IsUUID, MinLength
} from 'class-validator'


export class CreateClientProfileDto {

@IsString()
name:string;

@IsString()
nif :string;

@IsOptional()
@IsEmail()
email?:string;

@IsOptional()
@IsString()
phone?: string;

@IsUUID()
companyId: string;

@IsUUID()
@IsOptional()
userId?: string


}
