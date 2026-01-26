import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InvoiceService } from './invoice.service';
import { DataSource } from 'typeorm';
import { Contract } from '../contract/entities/contract.entity';
import { InvoiceType } from './enums';
import { Invoice } from './entities/invoice.entity';
import { ContractStatus } from '../contract/enums';

/**
 * @class InvoiceCronService
 * @description Rentix 2026 Automation Engine.
 * Manages the monthly billing cycle ensuring Multi-tenant integrity.
 * Normalized to English Tax Entity properties.
 */
@Injectable()
export class InvoiceCronService {
  private readonly logger = new Logger(InvoiceCronService.name);

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * @method handleAutoBilling
   * @description Monthly cron job (1st day of month at 00:01).
   */
  @Cron('01 00 1 * *')
  async handleAutoBilling() {
    this.logger.log('📅 [Cron] Starting monthly billing cycle');
    const contractRepo = this.dataSource.getRepository(Contract);
    const invoiceRepo = this.dataSource.getRepository(Invoice);

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // RIGOR: Loading relations with English naming convention
    const contracts = await contractRepo.find({
      where: { status: ContractStatus.ACTIVE, isActive: true },
      relations: ['tenants', 'tenants.profile', 'property', 'taxIva', 'taxIrpf'],
    });

    for (const contract of contracts) {
      try {
        if (!contract.tenants?.length) continue;
        
        const mainTenant = contract.tenants[0];
        if (!mainTenant.profile) {
          this.logger.warn(`⚠️ Contract [${contract.id}]: Tenant missing fiscal profile. Skipping...`);
          continue;
        }

        // Duplicity check: Does rent exist for this contract/period?
        const exists = await invoiceRepo.createQueryBuilder('invoice')
          .innerJoin('invoice.items', 'item')
          .where('invoice.contractId = :contractId', { contractId: contract.id })
          .andWhere('item.category = :category', { category: 'RENT' })
          .andWhere('item.periodMonth = :month', { month })
          .andWhere('item.periodYear = :year', { year })
          .andWhere('invoice.status != :status', { status: 'CANCELLED' })
          .getOne();

        if (exists) continue;

        await this.generateMonthlyDraft(contract, month, year);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        this.logger.error(`❌ Error in contract [${contract.id}]: ${errorMessage}`);
      }
    }
  }

  /**
   * @method generateMonthlyDraft
   * @description Atomic draft generation logic.
   */
  private async generateMonthlyDraft(contract: Contract, month: number, year: number) {
    const mainTenant = contract.tenants[0];
    const profileId = mainTenant.profile.id;

    // 🚩 RIGOR: Sincronizado con la Entidad Tax en inglés (percentage)
    const ivaRate = contract.taxIva ? Number(contract.taxIva.percentage || 0) : 0;
    const irpfRate = contract.taxIrpf ? Number(contract.taxIrpf.percentage || 0) : 0;

    await this.invoiceService.create({
      type: InvoiceType.ORDINARY,
      issueDate: new Date().toISOString().split('T')[0],
      clientId: profileId,
      propertyId: contract.propertyId,
      contractId: contract.id,
      items: [{
        category: 'RENT',
        description: `Monthly Rent ${month}/${year}`,
        unitPrice: Number(contract.baseRent),
        periodMonth: month,
        periodYear: year,
        discountPercentage: 0,
        applyTax: ivaRate > 0,
        taxPercentage: ivaRate,
        applyRetention: irpfRate > 0,
        retentionPercentage: irpfRate
      }]
    }, contract.companyId);

    this.logger.log(`✅ Draft generated: Contract ${contract.id} -> Client ${profileId}`);
  }
}