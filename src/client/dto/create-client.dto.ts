import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateClientDto {

  @ApiProperty({
    description: 'Empresa propietaria del cliente',
    example: 'f2a1e0d9-4c6a-4d1e-9b3a-1c2d3e4f5678',
  })
  @IsUUID()
  companyId: string;

  @ApiProperty({
    description: 'Identidad fiscal del cliente (FacturaeParty)',
    example: 'c1b2a3d4-1111-4aaa-9bbb-ccccdddd0000',
  })
  @IsUUID()
  facturaePartyId: string;

  @ApiProperty({
    description: 'Dirección fiscal del cliente',
    example: 'd4e5f6a7-2222-4bbb-8ccc-ddddeeeeffff',
  })
  @IsUUID()
  fiscalAddressId: string;
}
