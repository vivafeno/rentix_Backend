import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddressType } from '../enums/addres-type.enum';

export class CreateAddressDto {
  @ApiProperty({ example: 'Calle Falsa 123', description: 'Calle y número de la dirección' })
  @IsString()
  street: string;

  @ApiProperty({ example: 'Madrid', description: 'Ciudad' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Madrid', description: 'Provincia' })
  @IsString()
  province: string;

  @ApiProperty({ example: '28080', description: 'Código postal' })
  @IsString()
  postalCode: string;

  @ApiProperty({ example: 'España', description: 'País' })
  @IsString()
  country: string;

  @ApiPropertyOptional({
    enum: AddressType,
    example: AddressType.Fiscal,
    description: 'Tipo de dirección (por defecto: Fiscal)',
    default: AddressType.Fiscal
  })
  @IsEnum(AddressType)
  @IsOptional()
  type?: AddressType = AddressType.Fiscal;
}
