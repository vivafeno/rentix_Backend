import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({
    example: 'Industria Soluciones SL',
    description: 'Nombre de la empresa o razón social'
  })
  @IsString()
  name: string;
}
