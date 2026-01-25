import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InvoiceService } from './invoice.service';
import { DataSource } from 'typeorm';
import { Contract } from '../contract/entities/contract.entity';
import { InvoiceType } from './entities/invoice.entity';
import { ContractStatus } from '../contract/enums';

@Injectable()
export class InvoiceCronService {
  private readonly logger = new Logger(InvoiceCronService.name);

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly dataSource: DataSource,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleAutoBilling() {
    this.logger.log('Iniciando ciclo de facturación automática - Rentix 2026');

    const contractRepo = this.dataSource.getRepository(Contract);
    
    const contracts = await contractRepo.find({
      where: { 
        status: ContractStatus.ACTIVE,
        isActive: true 
      },
      relations: [
        'tenants', 
        'property', // Ahora conocemos sus campos internos
        'taxIva',   
        'taxIrpf'   
      ],
    });

    for (const contract of contracts) {
      try {
        if (contract.tenants?.length > 0) {
          await this.generateMonthlyDraft(contract);
        }
      } catch (error) {
        this.logger.error(`Error en automatización de contrato [${contract.id}]: ${error.message}`);
      }
    }
  }

  private async generateMonthlyDraft(contract: Contract) {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const month = nextMonth.getMonth() + 1;
    const year = nextMonth.getFullYear();

    const mainTenant = contract.tenants[0];
    const property = contract.property;

    // Mapeo fiscal preciso
    const ivaRate = contract.taxIva ? Number(contract.taxIva.porcentaje) : 0;
    const irpfRate = contract.taxIrpf ? Number(contract.taxIrpf.porcentaje) : 0;

    // Construcción de descripción profesional
    // Ej: "Renta 02/2026 - Ref: P-101 (Planta: 4º-B)"
    const floorInfo = property?.floorNumber ? ` (Planta: ${property.floorNumber})` : '';
    const itemDescription = `Renta mensual ${month.toString().padStart(2, '0')}/${year} - Ref: ${property?.internalCode || 'S/N'}${floorInfo}`;

    await this.invoiceService.create({
      type: InvoiceType.ORDINARY,
      issueDate: new Date().toISOString(),
      clientId: mainTenant.id,
      propertyId: contract.propertyId,
      contractId: contract.id,
      items: [
        {
          category: 'RENT',
          description: itemDescription,
          unitPrice: Number(contract.baseRent),
          periodMonth: month,
          periodYear: year,
          discountPercentage: 0,
          applyTax: true, 
          taxPercentage: ivaRate,
          applyRetention: irpfRate > 0,
          retentionPercentage: irpfRate,
          currentInstallment: 1,
          totalInstallments: 1
        }
      ]
    }, contract.companyId);

    this.logger.log(`Draft generado: [${property?.internalCode}] para ${mainTenant.name}`);
  }
}