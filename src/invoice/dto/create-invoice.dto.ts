import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsArray, 
  IsDateString, 
  IsEnum, 
  IsOptional, 
  IsUUID, 
  ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceType } from '../entities/invoice.entity';
import { CreateInvoiceItemDto } from './create-invoice-item.dto';

/**
 * @description DTO principal para crear una factura (inicialmente en estado DRAFT).
 */
export class CreateInvoiceDto {
  @ApiProperty({ enum: InvoiceType, example: InvoiceType.ORDINARY })
  @IsEnum(InvoiceType)
  type: InvoiceType;

  @ApiProperty({ example: '2026-01-15', description: 'Fecha de expedición legal' })
  @IsDateString()
  issueDate: string;

  @ApiPropertyOptional({ example: '2026-01-01', description: 'Fecha de devengo/operación' })
  @IsOptional()
  @IsDateString()
  operationDate?: string;

  @ApiProperty({ description: 'ID del cliente (Tenant)' })
  @IsUUID()
  clientId: string;

  @ApiPropertyOptional({ description: 'ID de la propiedad vinculada' })
  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @ApiPropertyOptional({ description: 'ID del contrato de origen' })
  @IsOptional()
  @IsUUID()
  contractId?: string;

  @ApiProperty({ type: [CreateInvoiceItemDto], description: 'Listado de líneas de factura' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}