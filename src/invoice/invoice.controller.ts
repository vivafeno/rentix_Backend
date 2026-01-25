import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  ParseUUIDPipe, Res, HttpStatus, UseGuards 
} from '@nestjs/common';
import { 
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody 
} from '@nestjs/swagger';
import type { Response } from 'express';

import { InvoiceService } from './invoice.service';
import { PdfService } from '../common/pdf/pdf.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice } from './entities/invoice.entity';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoice')
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly pdfService: PdfService
  ) {}

  @Get(':id/pdf')
  @ApiOperation({ 
    summary: 'Generar y descargar PDF de factura',
    description: 'Genera un documento PDF legal con nomenclatura YYYYMMDD_Referencia_Empresa. Requiere que la factura pertenezca a la empresa activa del usuario.'
  })
  @ApiParam({ name: 'id', description: 'UUID de la factura', example: '9f3c60e9-9c64-4442-8818-34528dca4943' })
  @ApiResponse({ status: 200, description: 'Archivo PDF generado con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token JWT ausente o inválido.' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada o no pertenece a la empresa.' })
  async getPdf(
    @Param('id', ParseUUIDPipe) id: string, 
    @GetUser('activeCompanyId') companyId: string,
    @Res() res: Response
  ) {
    const data = await this.invoiceService.getInvoiceDataForPdf(id, companyId);
    const buffer = await this.pdfService.generateInvoicePdf(data);

    const dateObj = new Date();
    const dateStamp = `${dateObj.getFullYear()}${String(dateObj.getMonth() + 1).padStart(2, '0')}${String(dateObj.getDate()).padStart(2, '0')}`;
    const invoiceRef = data.invoiceNumber !== 'BORRADOR' 
      ? data.invoiceNumber.replace(/\//g, '-') 
      : `B-${Date.now().toString().slice(-4)}`;
    const companyClean = data.companyName.replace(/[<>:"/\\|?*]/g, '').trim();

    const fileName = `${dateStamp}_${invoiceRef}_${companyClean}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length,
    });
    
    res.status(HttpStatus.OK).send(buffer);
  }

  @Post()
  @ApiOperation({ summary: 'Crear borrador de factura', description: 'Crea un registro en estado DRAFT para la empresa activa.' })
  @ApiBody({ type: CreateInvoiceDto })
  @ApiResponse({ status: 201, description: 'Borrador creado correctamente.', type: Invoice })
  @ApiResponse({ status: 409, description: 'Conflicto: Ya existe un cargo para ese periodo.' })
  create(
    @Body() dto: CreateInvoiceDto, 
    @GetUser('activeCompanyId') companyId: string
  ): Promise<Invoice> {
    return this.invoiceService.create(dto, companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar facturas', description: 'Obtiene todas las facturas vinculadas a la empresa activa del token.' })
  @ApiResponse({ status: 200, description: 'Listado de facturas.', type: [Invoice] })
  findAll(@GetUser('activeCompanyId') companyId: string): Promise<Invoice[]> {
    return this.invoiceService.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de factura' })
  @ApiResponse({ status: 200, type: Invoice })
  @ApiResponse({ status: 404, description: 'Factura no encontrada.' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string, 
    @GetUser('activeCompanyId') companyId: string
  ): Promise<Invoice> {
    return this.invoiceService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar borrador', description: 'Permite modificar datos de la factura siempre que esté en estado DRAFT.' })
  @ApiResponse({ status: 200, type: Invoice })
  @ApiResponse({ status: 400, description: 'No se puede modificar una factura ya emitida.' })
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() dto: UpdateInvoiceDto, 
    @GetUser('activeCompanyId') companyId: string
  ): Promise<Invoice> {
    return this.invoiceService.update(id, dto, companyId);
  }

  @Post(':id/emit')
  @ApiOperation({ 
    summary: 'Emitir factura legalmente', 
    description: 'Asigna número de serie, genera fingerprint y bloquea la factura para cumplir con Verifactu.' 
  })
  @ApiResponse({ status: 200, description: 'Factura emitida con éxito.', type: Invoice })
  emit(
    @Param('id', ParseUUIDPipe) id: string, 
    @GetUser('activeCompanyId') companyId: string
  ): Promise<Invoice> {
    return this.invoiceService.emit(id, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar borrador', description: 'Realiza un borrado lógico (soft-delete) de un borrador.' })
  @ApiResponse({ status: 204, description: 'Factura eliminada.' })
  remove(
    @Param('id', ParseUUIDPipe) id: string, 
    @GetUser('activeCompanyId') companyId: string
  ): Promise<void> {
    return this.invoiceService.remove(id, companyId);
  }
}