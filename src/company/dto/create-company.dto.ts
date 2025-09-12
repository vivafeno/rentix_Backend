import {
    IsEmail, IsOptional,  IsString, MinLength
} from 'class-validator'


export class CreateCompanyDto {
@IsString()
name: string;

}
