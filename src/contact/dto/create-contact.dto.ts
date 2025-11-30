import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { TipoContactoInterno } from '../entities/contact.entity';

export class CreateContactDto {
  @ApiProperty({
    example: 'Ana López',
    description: 'Nombre completo del contacto interno'
  })
  @IsString()
  nombre: string;

  @ApiProperty({
    enum: TipoContactoInterno,
    example: TipoContactoInterno.DIRECCION,
    description: 'Tipo de contacto interno'
  })
  @IsEnum(TipoContactoInterno)
  tipoContacto: TipoContactoInterno;

  @ApiPropertyOptional({
    example: 'ana.lopez@ejemplo.com',
    description: 'Correo electrónico del contacto (opcional)'
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: '612345678',
    description: 'Teléfono del contacto (opcional)'
  })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({
    example: 'Directora técnica',
    description: 'Cargo en la empresa (opcional)'
  })
  @IsString()
  @IsOptional()
  cargo?: string;

  @ApiPropertyOptional({
    example: 'Calle Falsa 123',
    description: 'Dirección postal del contacto (opcional)'
  })
  @IsString()
  @IsOptional()
  direccion?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Activo/inactivo (opcional, por defecto activo)'
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
