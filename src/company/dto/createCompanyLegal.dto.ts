import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { CreateFacturaePartyDto } from 'src/facturae/dto/createFacturaeParty.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';

export class CreateCompanyLegalDto {

  @ApiProperty({
    description: 'Usuario que será OWNER de la empresa',
    example: 'uuid',
  })
  @IsUUID()
  ownerUserId: string;

  @ApiProperty({
    description: 'Identidad fiscal (Facturae)',
    type: CreateFacturaePartyDto,
  })
  @ValidateNested()
  @Type(() => CreateFacturaePartyDto)
  facturaeParty: CreateFacturaePartyDto;

  @ApiProperty({
    description: 'Dirección fiscal',
    type: CreateAddressDto,
  })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  fiscalAddress: CreateAddressDto;

  @ApiProperty({
    description: 'Email de contacto',
    required: false,
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    description: 'Teléfono de contacto',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
