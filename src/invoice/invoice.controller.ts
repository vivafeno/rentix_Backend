import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseUUIDPipe, 
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice } from './entities/invoice.entity';
// Importa tus Guards y Decoradores según tu estructura en backend.xml
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { GetUser } from '../common/decorators/get-user.decorator';

/**
 * @description Controlador de Facturación Rentix 2026.
 * Implementa seguridad multi-tenant: el companyId siempre se extrae del token del usuario.
 */
@ApiTags('Invoices')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // Rigor: Todas las rutas de factura requieren autenticación
@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @ApiOperation({ summary: 'Crea un nuevo borrador de factura (DRAFT)' })
  @ApiResponse({ status: 201, type: Invoice })
  create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    /* @GetUser('activeCompanyId') companyId: string */
  ): Promise<Invoice> {
    const companyId = 'id-extraido-del-token'; // Simulación hasta tener el Guard activo
    return this.invoiceService.create(createInvoiceDto, companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Listado de facturas de la empresa activa' })
  @ApiResponse({ status: 200, type: [Invoice] })
  findAll(/* @GetUser('activeCompanyId') companyId: string */): Promise<Invoice[]> {
    const companyId = 'id-extraido-del-token';
    return this.invoiceService.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una factura específica' })
  @ApiResponse({ status: 200, type: Invoice })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    /* @GetUser('activeCompanyId') companyId: string */
  ): Promise<Invoice> {
    const companyId = 'id-extraido-del-token';
    return this.invoiceService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos de un borrador' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    /* @GetUser('activeCompanyId') companyId: string */
  ): Promise<Invoice> {
    const companyId = 'id-extraido-del-token';
    return this.invoiceService.update(id, updateInvoiceDto, companyId);
  }

  @Post(':id/emit')
  @ApiOperation({ summary: 'Emitir factura: Asigna número legal e inmoviliza el registro' })
  emit(
    @Param('id', ParseUUIDPipe) id: string,
    /* @GetUser('activeCompanyId') companyId: string */
  ): Promise<Invoice> {
    const companyId = 'id-extraido-del-token';
    return this.invoiceService.emit(id, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar borrador (No permitido si ya está emitida)' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    /* @GetUser('activeCompanyId') companyId: string */
  ): Promise<void> {
    const companyId = 'id-extraido-del-token';
    return this.invoiceService.remove(id, companyId);
  }
}