import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  ParseUUIDPipe, Res, HttpStatus, UseGuards 
} from '@nestjs/common';
import { 
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiProduces 
} from '@nestjs/swagger';
import type { Response } from 'express';

import { InvoiceService } from './invoice.service';
import { PdfService } from '../common/pdf/pdf.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice } from './entities/invoice.entity';

/**
 * @class InvoiceController
 * @description Gestión del ciclo de vida de facturación (Borradores, Emisión legal y Exportación).
 * Implementa blindaje Multi-tenant mediante 'activeCompanyId'.
 */
@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoice')
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly pdfService: PdfService
  ) {}

  /**
   * @method getPdf
   * @description Genera un documento PDF bajo estándares Verifactu.
   * El nombre del archivo sigue el patrón: [FECHA]_[NUM_FACTURA]_[EMPRESA].pdf
   */
  @Get(':id/pdf')
  @ApiProduces('application/pdf') // 🚩 RIGOR: Indica al generador de Angular que es un binario
  @ApiOperation({ 
    summary: 'Generar y descargar PDF de factura',
    description: 'Genera un documento PDF legal. Requiere que la factura pertenezca a la empresa activa.'
  })
  @ApiParam({ name: 'id', description: 'UUID de la factura', example: '9f3c60e9-9c64-4442-8818-34528dca4943' })
  @ApiResponse({ 
    status: 200, 
    description: 'Archivo PDF generado.',
    content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } } // 🚩 RIGOR: Tipado para OpenAPI
  })
  @ApiResponse({ status: 404, description: 'Factura no localizada o acceso denegado entre tenants.' })
  async getPdf(
    @Param('id', ParseUUIDPipe) id: string, 
    @GetUser('activeCompanyId') companyId: string,
    @Res() res: Response
  ) {
    const data = await this.invoiceService.getInvoiceDataForPdf(id, companyId);
    const buffer = await this.pdfService.generateFromTemplate('invoice', data);
    
    // Normalización de metadatos del archivo
    const dateObj = new Date();
    const dateStamp = dateObj.toISOString().slice(0,10).replace(/-/g, '');
    const invoiceRef = data.invoiceNumber !== 'BORRADOR' 
      ? data.invoiceNumber.replace(/\//g, '-') 
      : `B-${Date.now().toString().slice(-4)}`;
    
    const companyClean = data.companyName.replace(/[<>:"/\\|?*]/g, '').trim() || 'Rentix_Empresa';
    const fileName = `${dateStamp}_${invoiceRef}_${companyClean}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length,
      'x-invoice-id': id // Header personalizado para trazabilidad en el Front
    });
    
    res.status(HttpStatus.OK).send(buffer);
  }

  @Post()
  @ApiOperation({ summary: 'Crear borrador', description: 'Crea registro DRAFT vinculado a la empresa activa.' })
  @ApiBody({ type: CreateInvoiceDto })
  @ApiResponse({ status: 201, type: Invoice })
  create(
    @Body() dto: CreateInvoiceDto, 
    @GetUser('activeCompanyId') companyId: string
  ): Promise<Invoice> {
    return this.invoiceService.create(dto, companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar facturas de la empresa' })
  @ApiResponse({ status: 200, type: [Invoice] })
  findAll(@GetUser('activeCompanyId') companyId: string): Promise<Invoice[]> {
    return this.invoiceService.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de factura' })
  @ApiResponse({ status: 200, type: Invoice })
  findOne(
    @Param('id', ParseUUIDPipe) id: string, 
    @GetUser('activeCompanyId') companyId: string
  ): Promise<Invoice> {
    return this.invoiceService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar borrador' })
  @ApiResponse({ status: 200, type: Invoice })
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() dto: UpdateInvoiceDto, 
    @GetUser('activeCompanyId') companyId: string
  ): Promise<Invoice> {
    return this.invoiceService.update(id, dto, companyId);
  }

  @Post(':id/emit')
  @ApiOperation({ summary: 'Sellar y emitir factura (Verifactu)' })
  @ApiResponse({ status: 200, type: Invoice })
  emit(
    @Param('id', ParseUUIDPipe) id: string, 
    @GetUser('activeCompanyId') companyId: string
  ): Promise<Invoice> {
    return this.invoiceService.emit(id, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Anular/Eliminar borrador' })
  @ApiResponse({ status: 204 })
  remove(
    @Param('id', ParseUUIDPipe) id: string, 
    @GetUser('activeCompanyId') companyId: string
  ): Promise<void> {
    return this.invoiceService.remove(id, companyId);
  }
}