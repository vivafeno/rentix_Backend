import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  ParseUUIDPipe, 
  Res, 
  HttpStatus, 
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';

import { ReceiptService } from './receipt.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Receipts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('receipt')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Crear recibo o liquidación', 
    description: 'Genera un registro de fianza (DEPOSIT) o devolución (REFUND) para la empresa activa.' 
  })
  @ApiResponse({ status: 201, description: 'Recibo creado correctamente.' })
  create(
    @Body() dto: CreateReceiptDto, 
    @GetUser('activeCompanyId') companyId: string
  ) {
    return this.receiptService.create(dto, companyId);
  }

  @Get(':id/pdf')
  @ApiOperation({ 
    summary: 'Descargar PDF del recibo', 
    description: 'Genera el documento con redacción legal automática (Yo VVVV recibo de XXXX...)' 
  })
  @ApiResponse({ status: 200, description: 'Archivo PDF generado.' })
  @ApiResponse({ status: 404, description: 'Recibo no encontrado en esta empresa.' })
  async getPdf(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('activeCompanyId') companyId: string,
    @Res() res: Response,
  ) {
    // 🚩 Llamada sincronizada con tu ReceiptService
    const { buffer, fileName } = await this.receiptService.generatePdf(id, companyId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length,
    });

    res.status(HttpStatus.OK).send(buffer);
  }
}