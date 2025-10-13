import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { TipoContactoInterno } from '../entities/tipo-contacto-interno.enum';

export class CreateContactDto {
  @IsString()
  nombre: string;

  @IsEnum(TipoContactoInterno)
  tipoContacto: TipoContactoInterno;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  cargo?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
  
}
