import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, ValidateNested, IsNotEmpty, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

import { CreateFiscalDto } from '../../fiscal/dto/create-fiscal.dto';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { CreateCompanyDto } from './create-company.dto';
import { PersonType } from 'src/fiscal/enums/personType.enum';

/**
 * @class CreateCompanyLegalDto
 * @description DTO Maestro para la creación atómica de sujetos legales.
 * Orquesta la validación de los tres bloques: Empresa, Fiscal y Dirección.
 * @version 2026.2.1
 * @author Rentix 2026
 */
export class CreateCompanyLegalDto {
  /**
   * @description ID del usuario al que se vinculará la entidad (Owner original).
   */
  @ApiProperty({
    description: 'ID del usuario al que se vinculará la entidad (UUID v4)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'El ID de usuario debe ser un UUID válido' })
  @IsNotEmpty()
  userId: string;

  /**
   * @description Clasificación AEAT de la entidad.
   */
  @ApiProperty({
    enum: PersonType,
    enumName: 'PersonType',
    description: 'Naturaleza jurídica: F (Física) o J (Jurídica)',
  })
  @IsEnum(PersonType)
  @IsNotEmpty()
  personType: PersonType;

  /**
   * @description Datos básicos de la empresa/patrimonio.
   */
  @ApiProperty({
    description: 'Configuración básica de la entidad de empresa',
    type: CreateCompanyDto,
  })
  @ValidateNested()
  @Type(() => CreateCompanyDto)
  @IsNotEmpty()
  company: CreateCompanyDto;

  /**
   * @description Datos de identidad fiscal (Veri*factu Compliant).
   */
  @ApiProperty({
    description: 'Datos de identidad fiscal (NIF, Razón Social, etc)',
    type: CreateFiscalDto,
  })
  @ValidateNested()
  @Type(() => CreateFiscalDto)
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