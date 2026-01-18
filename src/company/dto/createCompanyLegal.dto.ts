import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

import { CreateFiscalDto } from '../../fiscal/dto/create-fiscal.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { CreateCompanyDto } from './';

/**
 * @class CreateCompanyLegalDto
 * @description DTO Maestro para la creación atómica de sujetos legales.
 * Orquesta la validación de los tres bloques: Empresa, Fiscal y Dirección.
 * @version 2026.2.0
 * @author Rentix
 */
export class CreateCompanyLegalDto {
  /**
   * @description ID del usuario al que se vinculará la entidad (Owner/Tenant/Viewer).
   */
  @ApiProperty({
    description: 'ID del usuario al que se vinculará la entidad (UUID v4)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'El ID de usuario debe ser un UUID válido' })
  @IsNotEmpty()
  userId: string;

  /**
   * @description Datos básicos de la empresa/patrimonio.
   */
  @ApiProperty({
    description: 'Configuración de la entidad de empresa',
    type: CreateCompanyDto,
  })
  @ValidateNested()
  @Type(() => CreateCompanyDto)
  @IsNotEmpty()
  company: CreateCompanyDto;

  /**
   * @description Datos de identidad fiscal (NIF, Razón Social, etc).
   */
  @ApiProperty({
    description: 'Datos de identidad fiscal (Veri*factu Compliant)',
    type: CreateFiscalDto,
  })
  @ValidateNested()
  @Type(() => CreateFiscalDto) // 🚩 Sincronizado con el nuevo nombre
  @IsNotEmpty()
  fiscal: CreateFiscalDto;

  /**
   * @description Dirección física para notificaciones legales.
   */
  @ApiProperty({
    description: 'Dirección fiscal y de notificaciones',
    type: CreateAddressDto,
  })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  @IsNotEmpty()
  address: CreateAddressDto;
}
