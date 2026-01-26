import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateInvoiceDto } from './create-invoice.dto';
import { IsOptional, IsString } from 'class-validator';

/**
 * @class UpdateInvoiceDto
 * @description DTO para la actualización de facturas en estado borrador.
 * Hereda las validaciones de CreateInvoiceDto pero hace los campos opcionales.
 * * RIGOR RENTIX 2026: 
 * 1. Los campos de control legal (invoiceNumber, status, fingerprint) están OMITIDOS.
 * 2. Si la factura ya está emitida, el Service rechazará este DTO por completo.
 */
export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {
  
  @ApiPropertyOptional({ 
    description: 'Notas internas o comentarios adicionales para el borrador',
    example: 'Revisar consumo de agua antes de emitir' 
  })
  @IsString()
  @IsOptional()
  notes?: string;

  /* * 🚩 NOTA DE SEGURIDAD FISCAL:
   * No incluimos 'status', 'invoiceNumber', 'fingerprint' ni 'issueDate'.
   * Estos campos son gestionados internamente por el InvoiceService.emit().
   * Gracias al ValidationPipe con { whitelist: true }, cualquier intento de 
   * inyectar estos campos en la petición será ignorado silenciosamente.
   */

  @ApiPropertyOptional({ 
    description: 'ID del contrato vinculado (opcional)',
    example: 'uuid-del-contrato',
    readOnly: true 
  })
  @IsOptional()
  contractId?: string;
}