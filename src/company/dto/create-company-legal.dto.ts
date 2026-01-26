import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, ValidateNested, IsNotEmpty, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

import { CreateFiscalDto } from '../../fiscal/dto/create-fiscal.dto';
import { CreateAddressDto } from '../../address/dto/create-address.dto'; // 🚩 Ruta relativa corregida
import { CreateCompanyDto } from './create-company.dto';
import { PersonType } from '../../fiscal/enums/person-type.enum'; // 🚩 Ruta relativa corregida

/**
 * @class CreateCompanyLegalDto
 * @description DTO Maestro para la creación atómica de sujetos legales.
 * Orquesta la validación de los tres bloques fundamentales: Empresa, Fiscal y Dirección.
 * Requisito indispensable para el cumplimiento Veri*factu desde el alta.
 * @version 2026.2.1
 */
export class CreateCompanyLegalDto {

  /**
   * @description ID del usuario al que se vinculará la entidad (Owner original).
   */
  @ApiProperty({
    description: 'ID del usuario propietario (UUID v4)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'El ID de usuario debe ser un UUID válido' })
  @IsNotEmpty()
  userId!: string; // 🚩 Rigor Rentix: ! para TS strict

  /**
   * @description Clasificación AEAT de la entidad.
   */
  @ApiProperty({
    enum: PersonType,
    enumName: 'PersonType',
    description: 'Naturaleza jurídica de la empresa: Física (F) o Jurídica (J)',
  })
  @IsEnum(PersonType)
  @IsNotEmpty()
  personType!: PersonType; // 🚩 Rigor Rentix: ! para TS strict

  /**
   * @description Datos básicos de la empresa/patrimonio.
   */
  @ApiProperty({
    description: 'Configuración y metadatos de la entidad de empresa',
    type: CreateCompanyDto,
  })
  @ValidateNested()
  @Type(() => CreateCompanyDto)
  @IsNotEmpty()
  company!: CreateCompanyDto; // 🚩 Rigor Rentix: ! para TS strict

  /**
   * @description Datos de identidad fiscal (Veri*factu Compliant).
   */
  @ApiProperty({
    description: 'Identidad fiscal legal (NIF, Razón Social, etc)',
    type: CreateFiscalDto,
  })
  @ValidateNested()
  @Type(() => CreateFiscalDto)
  @IsNotEmpty()
  fiscal!: CreateFiscalDto; // 🚩 Rigor Rentix: ! para TS strict

  /**
   * @description Dirección física para notificaciones legales.
   */
  @ApiProperty({
    description: 'Dirección fiscal y sede de notificaciones',
    type: CreateAddressDto,
  })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  @IsNotEmpty()
  address!: CreateAddressDto; // 🚩 Rigor Rentix: ! para TS strict
}