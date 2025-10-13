import { IsString, IsEnum, IsOptional } from 'class-validator';
import { AddressType } from '../enums/addres-type.enum';

export class CreateAddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  province: string;

  @IsString()
  postalCode: string;

  @IsString()
  country: string;

  @IsEnum(AddressType)
  @IsOptional()
  type?: AddressType = AddressType.Fiscal;
}
