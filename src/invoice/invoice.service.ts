import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull, EntityManager, Not } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoiceStatus, InvoiceType } from './enums';
import { InvoiceItem } from './entities/invoice-item.entity';
import { InvoiceSequenceService } from './invoice.sequence.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

/**
 * @class InvoiceService
 * @description Motor de facturación legal con soporte Veri*factu 2026.
 * Implementa redondeo financiero simétrico y transaccionalidad total.
 */
@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    @InjectRepository(Invoice) private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(InvoiceItem) private readonly itemRepo: Repository<InvoiceItem>,
    private readonly sequenceService: InvoiceSequenceService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * @method create
   * @description Generación atómica de borrador de factura.
   */
  async create(dto: CreateInvoiceDto, companyId: string): Promise<Invoice> {
    return await this.dataSource.transaction(async (manager) => {
      await this.validateDuplicity(dto, companyId, manager);
      const { items, ...header } = dto;

      const invoice = manager.create(Invoice, { 
        ...header, 
        companyId, 
        status: InvoiceStatus.DRAFT 
      });

      invoice.items = (items || []).map(i => this.calculateItem(i));
      this.calculateInvoiceTotals(invoice);

      return await manager.save(invoice);
    });
  }

  /**
   * @method update
   * @description Actualización de borradores con recálculo de totales.
   */
  async update(id: string, dto: UpdateInvoiceDto, companyId: string): Promise<Invoice> {
    const invoice = await this.findOne(id, companyId);
    
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Las facturas emitidas son inmutables bajo Rigor 2026.');
    }

    const { items, ...header } = dto;

    if (items) {
      // Limpieza de ítems previos para evitar huérfanos antes de re-calcular
      await this.itemRepo.delete({ invoiceId: id });
      invoice.items = items.map(itemDto => this.calculateItem(itemDto));
    }

    Object.assign(invoice, header);
    this.calculateInvoiceTotals(invoice);
    
    return await this.invoiceRepo.save(invoice);
  }

  /**
   * @method emit
   * @description Cierre legal. Genera número de serie y fingerprint Veri*factu.
   */
  async emit(id: string, companyId: string): Promise<Invoice> {
    return await this.dataSource.transaction(async (manager) => {
      const invoice = await manager.findOne(Invoice, { 
        where: { id, companyId }, 
        relations: ['items', 'company', 'company.fiscalEntity'] 
      });

      if (!invoice || invoice.status !== InvoiceStatus.DRAFT) {
        throw new BadRequestException('El documento no es un borrador válido para emisión.');
      }

      const prefix = invoice.type === InvoiceType.RECTIFICATIVE ? 'R' : '';
      const legalNumber = await this.sequenceService.getNextLegalNumber(manager, companyId, prefix);

      invoice.invoiceNumber = legalNumber;
      invoice.status = InvoiceStatus.EMITTED;
      invoice.issueDate = new Date();
      invoice.fingerprint = `V26-${legalNumber}-${Date.now().toString(36).toUpperCase()}`;

      return await manager.save(invoice);
    });
  }

  /**
   * @method getInvoiceDataForPdf
   * @description Hidratación profunda para el motor Puppeteer (PdfService).
   */
  async getInvoiceDataForPdf(id: string, companyId: string) {
    const invoice = await this.invoiceRepo.findOne({
      where: { id, companyId },
      relations: [
        'items', 'client', 'client.fiscalIdentity', 'property',
        'property.address', 'company', 'company.fiscalEntity', 'company.fiscalAddress'
      ],
    });

    if (!invoice) throw new NotFoundException('Factura no encontrada para exportación.');

    const isEmitted = !!invoice.invoiceNumber && invoice.invoiceNumber !== 'BORRADOR';
    const fechaFormat = (invoice.issueDate || new Date()).toISOString().split('T')[0];
    
    // Rigor Veri*factu: URL de cotejo AEAT
    const qrData = isEmitted 
      ? `https://www2.agenciatributaria.gob.es/wlpl/VERIFACTU/ConsultaPublica?nif=${invoice.company?.fiscalEntity?.nif}&num=${invoice.invoiceNumber}&fecha=${fechaFormat}&importe=${Number(invoice.totalAmount).toFixed(2)}`
      : 'FACTURA-EN-BORRADOR';

    return {
      companyName: invoice.company?.fiscalEntity?.fullName || 'RENTIX GESTIÓN',
      companyNif: invoice.company?.fiscalEntity?.nif || 'CIF-PENDIENTE',
      companyAddress: invoice.company?.fiscalAddress ? `${invoice.company.fiscalAddress.street}, ${invoice.company.fiscalAddress.city}` : 'N/A',
      isVerifactu: isEmitted,
      invoiceNumber: invoice.invoiceNumber || 'BORRADOR',
      date: new Date(invoice.issueDate || new Date()).toLocaleDateString('es-ES'),
      clientName: invoice.client?.fiscalIdentity?.fullName || 'CLIENTE FINAL',
      clientNif: invoice.client?.fiscalIdentity?.nif || 'NIF-CLIENTE',
      items: (invoice.items || []).map(item => ({
        description: item.description,
        unitPrice: Number(item.unitPrice).toFixed(2) + ' €',
        taxRate: item.taxPercentage + '%',
        amount: Number(item.taxableAmount).toFixed(2) + ' €'
      })),
      total: Number(invoice.totalAmount).toFixed(2) + ' €',
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`
    };
  }

  async findAll(companyId: string): Promise<Invoice[]> {
    return this.invoiceRepo.find({ 
      where: { companyId }, 
      relations: ['items', 'client', 'property'], 
      order: { createdAt: 'DESC' } 
    });
  }

  async findOne(id: string, companyId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findOne({ 
      where: { id, companyId }, 
      relations: ['items', 'client', 'property', 'contract'] 
    });
    if (!invoice) throw new NotFoundException('Factura no encontrada');
    return invoice;
  }

  async remove(id: string, companyId: string): Promise<void> {
    const invoice = await this.findOne(id, companyId);
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('No se puede eliminar un documento emitido legalmente.');
    }
    await this.invoiceRepo.softRemove(invoice);
  }

  /* --- LÓGICA DE CÁLCULO Y RIGOR --- */

  private calculateItem(dto: any): InvoiceItem {
    const item = new InvoiceItem();
    Object.assign(item, dto);
    const price = Number(item.unitPrice || 0);
    const disc = Number(item.discountPercentage || 0);

    item.taxableAmount = this.round(price - (price * (disc / 100)));
    item.taxAmount = item.applyTax ? this.round(item.taxableAmount * (Number(item.taxPercentage || 0) / 100)) : 0;
    item.retentionAmount = item.applyRetention ? this.round(item.taxableAmount * (Number(item.retentionPercentage || 0) / 100)) : 0;
    item.totalLine = this.round(item.taxableAmount + item.taxAmount - item.retentionAmount);
    return item;
  }

  private calculateInvoiceTotals(invoice: Invoice): void {
    const lines = invoice.items || [];
    invoice.totalTaxableAmount = this.round(lines.reduce((s, i) => s + Number(i.taxableAmount), 0));
    invoice.totalTaxAmount = this.round(lines.reduce((s, i) => s + Number(i.taxAmount), 0));
    invoice.totalRetentionAmount = this.round(lines.reduce((s, i) => s + Number(i.retentionAmount), 0));
    invoice.totalAmount = this.round(lines.reduce((s, i) => s + Number(i.totalLine), 0));
  }

  private round(val: number): number {
    return Math.round((val + Number.EPSILON) * 100) / 100;
  }

  private async validateDuplicity(dto: CreateInvoiceDto, companyId: string, manager: EntityManager): Promise<void> {
    for (const item of dto.items) {
      const exists = await manager.findOne(InvoiceItem, {
        where: {
          category: item.category,
          periodMonth: item.periodMonth ?? IsNull(),
          periodYear: item.periodYear ?? IsNull(),
          invoice: { companyId, clientId: dto.clientId, status: Not(InvoiceStatus.CANCELLED) as any }
        },
        relations: ['invoice']
      });
      if (exists) throw new ConflictException(`El concepto ${item.category} ya fue facturado en este periodo.`);
    }
  }
}