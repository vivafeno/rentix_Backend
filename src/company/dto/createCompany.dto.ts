import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateCompanyDto {

  @ApiProperty({
    description: 'Identidad fiscal (FacturaeParty)',
    example: 'a7c9b2e1-1234-4cde-9a88-ffeeddccbbaa',
  })
  @IsUUID()
  facturaePartyId: string;

  @ApiProperty({
    description: 'Dirección fiscal de la empresa',
    example: 'b8d1c9a2-5678-4fbc-8123-aabbccddeeff',
  })
  @IsUUID()
  fiscalAddressId: string;
}
