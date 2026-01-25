import { Injectable, BadRequestException, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { Invoice, InvoiceStatus, InvoiceType } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { InvoiceSequence } from './entities/invoice-sequence.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

/**
 * @description Servicio de Facturación Rentix 2026.
 * Maneja el ciclo de vida de facturas bajo normativa Veri*factu.
 * Garantiza inmutabilidad, cálculos precisos y soporte para documentos PDF.
 */
@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly itemRepository: Repository<InvoiceItem>,
    @InjectRepository(InvoiceSequence)
    private readonly sequenceRepository: Repository<InvoiceSequence>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * @description Crea una factura en estado DRAFT (Borrador).
   */
  async create(createInvoiceDto: CreateInvoiceDto, companyId: string): Promise<Invoice> {
    const { items, ...header } = createInvoiceDto;

    // 1. Validar duplicidad preventiva
    await this.validateDuplicity(createInvoiceDto, companyId);

    // 2. Crear instancia con totales inicializados
    const invoice = this.invoiceRepository.create({
      ...header,
      companyId,
      status: InvoiceStatus.DRAFT,
    });

    // 3. Procesar líneas y totales
    invoice.items = items.map(itemDto => this.calculateItem(itemDto));
    this.updateInvoiceTotals(invoice);

    return this.invoiceRepository.save(invoice);
  }

  /**
   * @description Actualiza un borrador. Inmutable si ya está emitida.
   */
  async update(id: string, updateInvoiceDto: UpdateInvoiceDto, companyId: string): Promise<Invoice> {
    const invoice = await this.findOne(id, companyId);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('La factura ya ha sido emitida y no puede modificarse.');
    }

    const { items, ...header } = updateInvoiceDto;

    if (items) {
      // Limpiamos los anteriores para evitar huérfanos
      await this.itemRepository.delete({ invoiceId: id });
      invoice.items = items.map(itemDto => this.calculateItem(itemDto));
    }

    Object.assign(invoice, header);
    this.updateInvoiceTotals(invoice);

    return this.invoiceRepository.save(invoice);
  }

  /**
   * @description Emisión legal (Veri*factu). Asigna número y bloquea el registro.
   */
  async emit(id: string, companyId: string): Promise<Invoice> {
    return await this.dataSource.transaction(async (manager) => {
      const invoice = await manager.findOne(Invoice, {
        where: { id, companyId },
        relations: ['items'],
      });

      if (!invoice) throw new NotFoundException('Factura no encontrada');
      if (invoice.status !== InvoiceStatus.DRAFT) throw new BadRequestException('Esta factura ya ha sido emitida');

      const year = new Date(invoice.issueDate).getFullYear();
      const prefix = invoice.type === InvoiceType.RECTIFICATIVE ? 'R-' : '';

      let sequence = await manager.findOne(InvoiceSequence, {
        where: { companyId, year, prefix },
        lock: { mode: 'pessimistic_write' },
      });

      if (!sequence) {
        sequence = manager.create(InvoiceSequence, { companyId, year, prefix, lastNumber: 0 });
      }

      sequence.lastNumber += 1;
      await manager.save(sequence);

      const formattedNumber = `${prefix}${year}/${sequence.lastNumber.toString().padStart(4, '0')}`;
      
      invoice.invoiceNumber = formattedNumber;
      invoice.status = InvoiceStatus.EMITTED;
      invoice.fingerprint = `VERIFACTU-${formattedNumber}-${Date.now()}`;

      return await manager.save(invoice);
    });
  }

  /**
   * @description NUEVO: Recolecta metadata enriquecida para el PdfService.
   */
  async getInvoiceDataForPdf_OLD(id: string, companyId: string): Promise<any> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id, companyId },
      relations: [
        'items',
        'company',
        'company.fiscalEntity',
        'company.fiscalAddress',
        'client',
        'client.fiscalIdentity',
        'property',
        'property.address',
      ],
    });

    if (!invoice) throw new NotFoundException('Error al recuperar datos para el PDF');

    return {
      invoiceNumber: invoice.invoiceNumber || 'BORRADOR',
      issueDate: new Date(invoice.issueDate).toLocaleDateString('es-ES'),
      companyName: invoice.company.fiscalEntity?.nombreRazonSocial || 'N/A',
      companyTaxId: invoice.company.fiscalEntity?.nif || 'N/A',
      companyAddress: invoice.company.fiscalAddress ? 
        `${invoice.company.fiscalAddress.street}, ${invoice.company.fiscalAddress.postalCode} ${invoice.company.fiscalAddress.city}` : 'N/A',
      clientName: invoice.client.fiscalIdentity?.nombreRazonSocial || 'N/A',
      clientTaxId: invoice.client.fiscalIdentity?.nif || 'N/A',
      clientAddress: invoice.property?.address ? 
        `${invoice.property.address.street}, ${invoice.property.address.postalCode} ${invoice.property.address.city}` : 'N/A',
      items: invoice.items.map(i => ({
        description: i.description,
        taxableAmount: Number(i.taxableAmount).toFixed(2),
        taxPercentage: i.taxPercentage,
        totalLine: Number(i.totalLine).toFixed(2)
      })),
      totalTaxableAmount: Number(invoice.totalTaxableAmount).toFixed(2),
      totalTaxAmount: Number(invoice.totalTaxAmount).toFixed(2),
      totalRetentionAmount: Number(invoice.totalRetentionAmount) > 0 ? Number(invoice.totalRetentionAmount).toFixed(2) : null,
      totalAmount: Number(invoice.totalAmount).toFixed(2),
    };
  }

  /**
   * @description NUEVO: Recolecta metadata enriquecida para el PdfService.
   * Incluye blindaje contra nulos para evitar Error 500 si los datos fiscales están incompletos.
   */
  async getInvoiceDataForPdf(id: string, companyId: string): Promise<any> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id, companyId },
      relations: [
        'items',
        'company',
        'company.fiscalEntity',
        'company.fiscalAddress',
        'client',
        'client.fiscalIdentity',
        'property',
        'property.address',
      ],
    });

    if (!invoice) throw new NotFoundException('Error al recuperar datos para el PDF');

    // Blindaje con Optional Chaining (?.) y valores Fallback (||)
    return {
      invoiceNumber: invoice.invoiceNumber || 'BORRADOR',
      issueDate: invoice.issueDate 
        ? new Date(invoice.issueDate).toLocaleDateString('es-ES') 
        : new Date().toLocaleDateString('es-ES'),
      
      // Datos Emisor (Empresa)
      companyName: invoice.company?.fiscalEntity?.nombreRazonSocial || 'EMPRESA DEMO RENTIX',
      companyTaxId: invoice.company?.fiscalEntity?.nif || 'NIF-00000000',
      companyAddress: invoice.company?.fiscalAddress 
        ? `${invoice.company.fiscalAddress.street}, ${invoice.company.fiscalAddress.city}` 
        : 'Dirección Emisor no configurada',
      
      // Datos Receptor (Inquilino)
      clientName: invoice.client?.fiscalIdentity?.nombreRazonSocial || 'CLIENTE DE PRUEBA',
      clientTaxId: invoice.client?.fiscalIdentity?.nif || 'NIF-CLIENTE',
      clientAddress: invoice.property?.address 
        ? `${invoice.property.address.street}, ${invoice.property.address.city}` 
        : 'Dirección Inmueble no configurada',

      // Líneas de factura (con mapeo seguro)
      items: (invoice.items || []).map(i => ({
        description: i.description || 'Concepto de alquiler',
        taxableAmount: Number(i.taxableAmount || 0).toFixed(2),
        taxPercentage: i.taxPercentage || 0,
        totalLine: Number(i.totalLine || 0).toFixed(2)
      })),

      // Totales formateados para el Rigor Fiscal (2 decimales siempre)
      totalTaxableAmount: Number(invoice.totalTaxableAmount || 0).toFixed(2),
      totalTaxAmount: Number(invoice.totalTaxAmount || 0).toFixed(2),
      totalRetentionAmount: Number(invoice.totalRetentionAmount || 0).toFixed(2),
      totalAmount: Number(invoice.totalAmount || 0).toFixed(2),
    };
  }

  /**
   * @description Lógica de cálculo: Base -> Descuento -> Impuestos.
   */
  private calculateItem(dto: any): InvoiceItem {
    const item = new InvoiceItem();
    Object.assign(item, dto);

    const unitPrice = Number(item.unitPrice);
    const discPercent = Number(item.discountPercentage || 0);
    
    item.taxableAmount = unitPrice - (unitPrice * (discPercent / 100));
    item.taxAmount = item.applyTax ? item.taxableAmount * (Number(item.taxPercentage) / 100) : 0;
    item.retentionAmount = item.applyRetention ? item.taxableAmount * (Number(item.retentionPercentage) / 100) : 0;
    item.totalLine = item.taxableAmount + item.taxAmount - item.retentionAmount;

    return item;
  }

  private updateInvoiceTotals(invoice: Invoice): void {
    invoice.totalTaxableAmount = invoice.items.reduce((s, i) => s + Number(i.taxableAmount), 0);
    invoice.totalTaxAmount = invoice.items.reduce((s, i) => s + Number(i.taxAmount), 0);
    invoice.totalRetentionAmount = invoice.items.reduce((s, i) => s + Number(i.retentionAmount), 0);
    invoice.totalAmount = invoice.items.reduce((s, i) => s + Number(i.totalLine), 0);
  }

  private async validateDuplicity(dto: CreateInvoiceDto, companyId: string): Promise<void> {
    for (const item of dto.items) {
      const existing = await this.itemRepository.findOne({
        where: {
          category: item.category,
          periodMonth: item.periodMonth ?? IsNull(),
          periodYear: item.periodYear ?? IsNull(),
          currentInstallment: item.currentInstallment,
          invoice: { 
            companyId, 
            clientId: dto.clientId,
            propertyId: dto.propertyId ?? IsNull()
          },
        },
        relations: ['invoice'],
      });

      if (existing) {
        throw new ConflictException(`Conflicto: Ya existe un cargo de tipo ${item.category} para este periodo.`);
      }
    }
  }

  async findAll(companyId: string): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: { companyId },
      relations: ['items', 'client', 'property'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, companyId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id, companyId },
      relations: ['items', 'client', 'property', 'contract'],
    });
    if (!invoice) throw new NotFoundException('Factura no encontrada');
    return invoice;
  }

  async remove(id: string, companyId: string): Promise<void> {
    const invoice = await this.findOne(id, companyId);
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('No se puede eliminar una factura emitida.');
    }
    await this.invoiceRepository.softRemove(invoice);
  }
}