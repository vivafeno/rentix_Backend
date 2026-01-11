import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppRole } from 'src/auth/enums/user-global-role.enum';

export class UserDto {
  @ApiProperty({ 
    description: 'Identificador único (UUID v4)',
    example: 'c3f6c9c1-9e9a-4a4b-8f88-3b8b9e7b6c21' 
  })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiPropertyOptional({ 
    description: 'Nombre de pila del usuario',
    example: 'Juan' 
  })
  firstName?: string;

  @ApiPropertyOptional({ 
    description: 'Apellidos del usuario',
    example: 'Pérez' 
  })
  lastName?: string;

  @ApiProperty({ 
    enum: AppRole, 
    example: AppRole.USER, 
    description: 'Rol de acceso global a la plataforma' 
  })
  appRole: AppRole;

  @ApiProperty({ 
    description: 'Estado de la cuenta (activo/inactivo)',
    example: true 
  })
  isActive: boolean;

  @ApiProperty({ 
    description: 'Fecha de creación del registro',
    type: 'string', 
    format: 'date-time' 
  })
  createdAt: Date;

  @ApiProperty({ 
    description: 'Fecha de la última actualización',
    type: 'string', 
    format: 'date-time' 
  })
  updatedAt: Date;
}