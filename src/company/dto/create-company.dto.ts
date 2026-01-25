import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, IsUUID } from 'class-validator';

/**
 * @class CreateCompanyDto
 * @description Atributos específicos de la entidad Company.
 * No incluye objetos anidados fiscales, ya que de eso se encarga el DTO Legal Maestro.
 * @version 2026.2.2
 * @author Rentix 2026
 */
export class CreateCompanyDto {
  
  @ApiPropertyOptional({ 
    description: 'Nombre comercial o marca del patrimonio',
    example: 'Rentix PropTech' 
  })
  @IsString()
  @IsOptional()
  commercialName?: string;

  @ApiPropertyOptional({ 
    description: 'URL del logotipo de la empresa',
    example: 'https://cdn.rentix.com/logos/company1.png' 
  })
  @IsUrl({}, { message: 'El logo debe ser una URL válida' })
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'ID de una entidad fiscal existente (opcional)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4')
  @IsOptional()
  fiscalEntityId?: string;

  @ApiPropertyOptional({
    description: 'ID de una dirección existente (opcional)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4')
  @IsOptional()
  fiscalAddressId?: string;
}