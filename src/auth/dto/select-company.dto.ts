import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

/**
 * @description DTO para el cambio de contexto empresarial.
 */
export class SelectCompanyDto {
  @ApiProperty({
    description: 'UUID de la empresa a la que se desea cambiar el contexto',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  companyId: string;
}