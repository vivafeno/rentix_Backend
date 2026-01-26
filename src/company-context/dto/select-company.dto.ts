import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SelectCompanyDto {
  @ApiProperty({
    description:
      'UUID de la empresa que el usuario quiere activar como compañía actual en sesión',
    example: '8e2c4cae-5a4f-4264-befe-2a406fa4adcb',
  })
  @IsUUID()
  companyId!: string;
}
