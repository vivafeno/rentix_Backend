import { Injectable, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Receipt, ReceiptType } from './entities/receipt.entity';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { PdfService } from '../common/pdf/pdf.service';

/**
 * @class ReceiptService
 * @description Gestión de tesorería y documentos PDF.
 * Corregido para cumplimiento de TypeScript Strict Mode y consistencia de Entidades.
 */
@Injectable()
export class ReceiptService {
  private readonly logger = new Logger(ReceiptService.name);

  constructor(
    @InjectRepository(Receipt)
    private readonly repo: Repository<Receipt>,
    private readonly pdfService: PdfService,
  ) { }

  async create(dto: CreateReceiptDto, activeCompanyId: string): Promise<Receipt> {
    const prefix = dto.type === ReceiptType.DEPOSIT ? 'REC' : 'DEV';
    const shortId = Date.now().toString().slice(-6);

    const receipt = this.repo.create({
      ...dto,
      activeCompanyId,
      number: `${prefix}-${shortId}`,
    });

    try {
      return await this.repo.save(receipt);
    } catch (error: unknown) {
      // 🚩 SOLUCIÓN TS18046: Type Guard para acceder al mensaje de error
      const message = error instanceof Error ? error.message : 'Error de persistencia desconocido';
      this.logger.error(`Error persistiendo recibo: ${message}`);
      throw new InternalServerErrorException('Fallo en la creación del recibo.');
    }
  }

  async findAll(activeCompanyId: string): Promise<Receipt[]> {
    return await this.repo.find({
      where: { activeCompanyId },
      relations: ['tenant'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, activeCompanyId: string): Promise<Receipt> {
    const receipt = await this.repo.findOne({
      where: { id, activeCompanyId },
      relations: ['company', 'company.fiscalEntity', 'tenant'],
    });

    if (!receipt) {
      throw new NotFoundException(`Recibo [${id}] no localizado.`);
    }

    return receipt;
  }

  async generatePdf(id: string, activeCompanyId: string): Promise<{ buffer: Buffer, fileName: string }> {
    const receipt = await this.findOne(id, activeCompanyId);
    
    const emisor = receipt.company?.fiscalEntity?.officialName || 'EMISOR NO CONFIGURADO';
    
    // 🚩 SOLUCIÓN TS2339: Ajustado a 'fullName' (o el nombre legal definido en TenantProfile)
    // Usamos el operador de encadenamiento opcional para seguridad total
    const receptor = receipt.tenant 
      ? (receipt.tenant as any).fullName || (receipt.tenant as any).name || 'CLIENTE REGISTRADO' 
      : (receipt.manualTenantName || 'CLIENTE FINAL');

    const formattedAmount = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(receipt.amount);

    const pdfPayload = {
      type: receipt.type,
      title: receipt.type === ReceiptType.DEPOSIT ? 'RECIBO DE FIANZA' : 'LIQUIDACIÓN DE DEPÓSITO',
      emisor,
      receptor,
      amount: formattedAmount,
      concept: receipt.concept,
      date: receipt.issueDate ? receipt.issueDate.toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES'),
      number: receipt.number,
      isDeposit: receipt.type === ReceiptType.DEPOSIT 
    };

    try {
      const buffer = await this.pdfService.generateFromTemplate('RECEIPT', pdfPayload);
      const dateStamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const safeReceptor = receptor.replace(/\s+/g, '_').substring(0, 20);
      const fileName = `${dateStamp}_${receipt.number}_${safeReceptor}.pdf`;
      
      return { buffer, fileName };
    } catch (error: unknown) {
      // 🚩 SOLUCIÓN TS18046: Type Guard para la generación de PDF
      const message = error instanceof Error ? error.message : 'Error en motor PDF';
      this.logger.error(`Error generando PDF para recibo ${id}: ${message}`);
      throw new InternalServerErrorException('Error al procesar el archivo PDF.');
    }
  }
}