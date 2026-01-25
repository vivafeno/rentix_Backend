import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
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
 * Garantiza inmutabilidad, cálculos precisos y prevención de duplicados.
 */
@Injectable()
export class InvoiceService {
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

    // Si se envían nuevos items, reemplazamos la colección
    if (items) {
      // Nota: El cascade insert de TypeORM se encargará de los nuevos, 
      // pero debemos limpiar los anteriores para evitar huérfanos.
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

      // Bloqueo pesimista para evitar colisión de números correlativos
      let sequence = await manager.findOne(InvoiceSequence, {
        where: { companyId, year, prefix },
        lock: { mode: 'pessimistic_write' },
      });

      if (!sequence) {
        sequence = manager.create(InvoiceSequence, { companyId, year, prefix, lastNumber: 0 });
      }

      sequence.lastNumber += 1;
      await manager.save(sequence);

      // Formateo legal: Prefijo + Año / Número (ej: R-2026/0001)
      const formattedNumber = `${prefix}${year}/${sequence.lastNumber.toString().padStart(4, '0')}`;
      
      invoice.invoiceNumber = formattedNumber;
      invoice.status = InvoiceStatus.EMITTED;
      invoice.fingerprint = `VERIFACTU-${formattedNumber}-${Date.now()}`; // Simulación de hash

      return await manager.save(invoice);
    });
  }

  /**
   * @description Lógica de cálculo: Base -> Descuento -> Impuestos.
   */
  private calculateItem(dto: any): InvoiceItem {
    const item = new InvoiceItem();
    Object.assign(item, dto);

    const unitPrice = Number(item.unitPrice);
    const discPercent = Number(item.discountPercentage || 0);
    
    // Cálculo de base neta
    item.taxableAmount = unitPrice - (unitPrice * (discPercent / 100));

    // Cálculo de cuotas
    item.taxAmount = item.applyTax ? item.taxableAmount * (Number(item.taxPercentage) / 100) : 0;
    item.retentionAmount = item.applyRetention ? item.taxableAmount * (Number(item.retentionPercentage) / 100) : 0;

    // Total línea: Neto + IVA - Retención
    item.totalLine = item.taxableAmount + item.taxAmount - item.retentionAmount;

    return item;
  }

  /**
   * @description Actualiza los campos de resumen de la cabecera sumando sus líneas.
   */
  private updateInvoiceTotals(invoice: Invoice): void {
    invoice.totalTaxableAmount = invoice.items.reduce((s, i) => s + Number(i.taxableAmount), 0);
    invoice.totalTaxAmount = invoice.items.reduce((s, i) => s + Number(i.taxAmount), 0);
    invoice.totalRetentionAmount = invoice.items.reduce((s, i) => s + Number(i.retentionAmount), 0);
    invoice.totalAmount = invoice.items.reduce((s, i) => s + Number(i.totalLine), 0);
  }

  /**
   * @description Verifica si ya se facturó el mismo concepto para el mismo periodo/inmueble.
   */
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
        throw new ConflictException(
          `Conflicto: Ya existe un cargo de tipo ${item.category} para este periodo e inmueble.`
        );
      }
    }
  }

  // --- MÉTODOS DE CONSULTA Y BORRADO ---

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
      throw new BadRequestException('No se puede eliminar una factura emitida. Debe ser anulada legalmente.');
    }
    await this.invoiceRepository.softRemove(invoice);
  }
}