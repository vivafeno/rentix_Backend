import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { TenantStatus } from '../enums/tenant-status.enum';
import { CreateTenantProfileDto } from './../../tenant-profile/dto/create-tenant-profile.dto'; // 🚩 Path corregido a relativo local

export class CreateTenantDto {
  
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  name: string;

  @ApiProperty({ example: 'inquilino@email.com' })
  @IsEmail({}, { message: 'El formato del email no es válido.' })
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ enum: TenantStatus, default: TenantStatus.ACTIVE })
  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus;

  @ApiProperty({ type: () => CreateTenantProfileDto })
  @ValidateNested()
  @Type(() => CreateTenantProfileDto) // 🚩 Crucial para hidratar el sub-objeto
  @IsNotEmpty()
  profile: CreateTenantProfileDto;
}