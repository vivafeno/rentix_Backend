import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'ID de la identidad fiscal (creada en el Paso 3)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  facturaePartyId: string;

  @ApiProperty({
    description: 'ID de la dirección física (creada en el Paso 2)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  fiscalAddressId: string;

  @ApiProperty({
    description: 'ID del usuario que será el OWNER de la empresa (seleccionado/creado en el Paso 1)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}