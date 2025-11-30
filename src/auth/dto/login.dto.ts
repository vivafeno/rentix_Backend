import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ 
    example: 'user@example.com', 
    description: 'Correo electrónico del usuario. Debe ser único y registrado previamente.' 
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    example: 'password123', 
    description: 'Contraseña del usuario (mínimo 6 caracteres)' 
  })
  @IsString()
  @MinLength(6)
  password: string;
}
