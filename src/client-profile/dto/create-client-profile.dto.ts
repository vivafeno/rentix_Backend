import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID
} from 'class-validator';

export class CreateClientProfileDto {
  @ApiProperty({
    example: 'Pepe González SL',
    description: 'Nombre completo o razón social del cliente'
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'B12345678',
    description: 'NIF/CIF del cliente'
  })
  @IsString()
  nif: string;

  @ApiPropertyOptional({
    example: 'pepe@email.com',
    description: 'Correo electrónico del cliente (opcional)'
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: '612345678',
    description: 'Teléfono del cliente (opcional)'
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: '60eb3add-8fb2-4f82-8233-4ff2b12a156d',
    description: 'UUID de la empresa asociada'
  })
  @IsUUID()
  companyId: string;

  @ApiPropertyOptional({
    example: '70ab3cde-1be2-4f18-b233-5ae2c67b34ef',
    description: 'UUID del usuario asociado (opcional)'
  })
  @IsUUID()
  @IsOptional()
  userId?: string;
}
