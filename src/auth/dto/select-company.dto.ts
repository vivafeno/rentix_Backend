import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * @class SelectCompanyDto
 * @description DTO para el cambio de contexto empresarial (Switch Tenant).
 * Asegura que el identificador sea un UUID válido y sanitizado antes de la validación de permisos.
 */
export class SelectCompanyDto {
  @ApiProperty({
    description: 'UUID de la empresa a la que se desea cambiar el contexto operativo',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'El identificador de la empresa debe ser un UUID v4 válido.' })
  @IsNotEmpty({ message: 'El ID de la empresa es obligatorio para cambiar de contexto.' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  readonly companyId: string; // 🚩 Rigor: Inmutable para evitar contaminación durante el ciclo de vida
}