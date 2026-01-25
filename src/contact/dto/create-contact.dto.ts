import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsEmail, 
  IsEnum, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  IsUUID, 
  MaxLength, 
  MinLength 
} from 'class-validator';
import { ContactType } from '../enums/contact-type.enum';

/**
 * @class CreateContactDto
 * @description DTO para el alta de contactos. El estado 'isActive' no se incluye
 * ya que el sistema lo inicializa automáticamente como true.
 */
export class CreateContactDto {

  @ApiProperty({
    description: 'Nombre completo del contacto',
    example: 'Ana López Martínez',
    minLength: 3,
    maxLength: 150
  })
  @IsString({ message: 'validation.IS_STRING' })
  @IsNotEmpty({ message: 'validation.IS_NOT_EMPTY' })
  @MinLength(3, { message: 'validation.MIN_LENGTH' })
  @MaxLength(150, { message: 'validation.MAX_LENGTH' })
  fullName: string;

  @ApiProperty({
    description: 'Tipo o categoría del contacto',
    enum: ContactType,
    example: ContactType.MAINTENANCE
  })
  @IsEnum(ContactType, { message: 'validation.IS_ENUM' })
  @IsNotEmpty({ message: 'validation.IS_NOT_EMPTY' })
  type: ContactType;

  @ApiPropertyOptional({
    description: 'Correo electrónico de contacto',
    example: 'ana.lopez@empresa.com'
  })
  @IsOptional()
  @IsEmail({}, { message: 'validation.IS_EMAIL' })
  @MaxLength(150, { message: 'validation.MAX_LENGTH' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto',
    example: '+34 600 000 000'
  })
  @IsOptional()
  @IsString({ message: 'validation.IS_STRING' })
  @MaxLength(20, { message: 'validation.MAX_LENGTH' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Cargo o posición en la empresa',
    example: 'Gerente de Cuentas'
  })
  @IsOptional()
  @IsString({ message: 'validation.IS_STRING' })
  @MaxLength(100, { message: 'validation.MAX_LENGTH' })
  position?: string;

  @ApiPropertyOptional({
    description: 'Dirección física específica',
    example: 'Calle Mayor 1, Madrid'
  })
  @IsOptional()
  @IsString({ message: 'validation.IS_STRING' })
  address?: string;

  @ApiPropertyOptional({
    description: 'Notas adicionales sobre el contacto',
    example: 'No llamar después de las 18:00'
  })
  @IsOptional()
  @IsString({ message: 'validation.IS_STRING' })
  notes?: string;

  // --- VINCULACIONES ---

  @ApiPropertyOptional({
    description: 'UUID de la empresa asociada',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsOptional()
  @IsUUID('4', { message: 'validation.IS_UUID' })
  companyId?: string;

  @ApiPropertyOptional({
    description: 'UUID del inquilino asociado',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsOptional()
  @IsUUID('4', { message: 'validation.IS_UUID' })
  tenantId?: string;
}