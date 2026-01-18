import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsOptional, 
  IsString, 
  IsUUID, 
  ValidateNested, 
  IsEmail,
  MaxLength,
  IsNotEmpty
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Importaciones corregidas según tus rutas
import { CreateFiscalEntityDto } from 'src/fiscal/dto/create-fiscal.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { CreateCompanyDto } from './createCompany.dto';

/**
 * @description DTO Maestro para la creación atómica de sujetos legales.
 * Orquesta la validación de los tres bloques: Empresa, Fiscal y Dirección.
 * @version 2026.1.17
 */
export class CreateCompanyLegalDto {

  @ApiProperty({
    description: 'ID del usuario al que se vinculará la entidad (Owner/Tenant/Viewer)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'El ID de usuario debe ser un UUID válido' })
  @IsNotEmpty()
  userId: string;

  /**
   * @description Datos básicos de la empresa (Nombre comercial, email, teléfono).
   * Resuelve el error de propiedad inexistente en el Service.
   */
  @ApiProperty({ type: CreateCompanyDto })
  @ValidateNested()
  @Type(() => CreateCompanyDto)
  @IsNotEmpty()
  company: CreateCompanyDto;

  @ApiProperty({
    description: 'Datos de identidad fiscal (Alineado con FacturaE/VeriFactu)',
    type: CreateFiscalEntityDto,
  })
  @ValidateNested()
  @Type(() => CreateFiscalEntityDto)
  @IsNotEmpty()
  fiscal: CreateFiscalEntityDto;

  @ApiProperty({
    description: 'Dirección fiscal y de notificaciones',
    type: CreateAddressDto,
  })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  @IsNotEmpty()
  address: CreateAddressDto;
}