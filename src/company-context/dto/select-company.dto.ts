// src/company-context/dto/select-company.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SelectCompanyDto {
  @ApiProperty({ description: 'UUID de la empresa que el usuario quiere activar' })
  @IsUUID()
  companyId: string;
}
