import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsEnum, IsString, MinLength } from 'class-validator';
import { UserGlobalRole } from '../entities/user.entity'; 

export class CreateUserDto {
  @ApiProperty({
    description: 'Correo electrónico único del usuario',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
    example: 'StrongPassword123!',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    description: 'Rol global del usuario (ej. superadmin)',
    example: 'superadmin, admin, user',
  })
  @IsEnum(UserGlobalRole)
  userGlobalRole: UserGlobalRole;
}
