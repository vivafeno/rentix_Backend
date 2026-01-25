import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateInvoiceDto } from './create-invoice.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { InvoiceStatus } from '../entities/invoice.entity';

/**
 * @description DTO para la actualización de facturas.
 * Hereda las validaciones de CreateInvoiceDto pero hace los campos opcionales.
 * RIGOR RENTIX: Los campos de seguridad (hash, numeración) no están expuestos aquí.
 */
export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {
  
  // No incluimos 'status' aquí para evitar que el usuario se salte 
  // el proceso de emisión legal mediante un simple Patch.
  // El cambio de estado se gestiona exclusivamente por el método emit() en el Service.

  @ApiPropertyOptional({ 
    description: 'Notas internas o comentarios adicionales para el borrador',
    example: 'Revisar consumo de agua antes de emitir' 
  })
  @IsOptional()
  notes?: string; 
}