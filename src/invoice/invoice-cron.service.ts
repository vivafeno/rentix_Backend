import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InvoiceService } from './invoice.service';
import { DataSource } from 'typeorm';
import { Contract } from '../contract/entities/contract.entity';
import { Invoice, InvoiceType } from './entities/invoice.entity';
import { ContractStatus } from '../contract/enums';

@Injectable()
export class InvoiceCronService {
  private readonly logger = new Logger(InvoiceCronService.name);

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly dataSource: DataSource,
  ) { }

  /**
   * @description Disparador mensual: Día 1 a las 00:01 AM.
   * Punto de control para la generación masiva de borradores.
   * Blindado contra duplicados para permitir re-ejecuciones seguras.
   */
  @Cron('01 00 1 * *')
  async handleAutoBilling() {
    this.logger.log('📅 [Cron] Iniciando ciclo de facturación mensual Rentix 2026');

    const contractRepo = this.dataSource.getRepository(Contract);
    const invoiceRepo = this.dataSource.getRepository(Invoice);

    // Al ejecutarse el día 1, el mes actual es el objetivo de cobro (pago por adelantado)
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // 1. Buscamos todos los contratos que deben facturar hoy
    const contracts = await contractRepo.find({
      where: {
        status: ContractStatus.ACTIVE,
        isActive: true
      },
      relations: ['tenants', 'property', 'taxIva', 'taxIrpf'],
    });

    if (contracts.length === 0) {
      this.logger.log('ℹ️ No hay contratos activos para procesar este mes.');
      return;
    }

    for (const contract of contracts) {
      try {
        if (!contract.tenants?.length) {
          this.logger.warn(`⚠️ Saltando contrato ${contract.id}: No tiene titulares vinculados.`);
          continue;
        }

        // 2. RIGOR: Validar que no exista ya un borrador o factura emitida para este contrato/periodo/renta
        // Esto permite crear facturas manuales anticipadas sin que el cron las duplique.
        const exists = await invoiceRepo.createQueryBuilder('invoice')
          .innerJoin('invoice.items', 'item')
          .where('invoice.contractId = :contractId', { contractId: contract.id })
          .andWhere('item.category = :category', { category: 'RENT' })
          .andWhere('item.periodMonth = :month', { month })
          .andWhere('item.periodYear = :year', { year })
          .getOne();

        if (exists) {
          this.logger.log(`✅ Contrato ${contract.id} ya cuenta con factura para ${month}/${year}.`);
          continue;
        }

        // 3. Generar el borrador con datos reales y actualizados
        await this.generateMonthlyDraft(contract, month, year);

      } catch (error) {
        this.logger.error(`❌ Error en automatización de contrato [${contract.id}]: ${error.message}`);
      }
    }
    this.logger.log('🏁 Ciclo de facturación mensual completado.');
  }

  private async generateMonthlyDraft(contract: Contract, month: number, year: number) {
    const mainTenant = contract.tenants[0];
    const property = contract.property;

    // Normalización de tipos (Postgres Decimal -> JS Number)
    const ivaRate = contract.taxIva ? Number(contract.taxIva.porcentaje) : 0;
    const irpfRate = contract.taxIrpf ? Number(contract.taxIrpf.porcentaje) : 0;

    // Construcción de descripción profesional según Rigor Rentix
    const floorInfo = property?.floorNumber ? ` (Planta: ${property.floorNumber})` : '';
    const itemDescription = `Renta mensual ${month.toString().padStart(2, '0')}/${year} - Ref: ${property?.internalCode || 'S/N'}${floorInfo}`;

    await this.invoiceService.create({
      type: InvoiceType.ORDINARY, // Equivale a F1
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
          // Dinamismo Fiscal: Solo aplicamos si el porcentaje es > 0
          applyTax: ivaRate > 0,
          taxPercentage: ivaRate,
          applyRetention: irpfRate > 0,
          retentionPercentage: irpfRate,
          currentInstallment: 1,
          totalInstallments: 1
        }
      ]
    }, contract.companyId);

    this.logger.log(`✨ Draft generado: [${property?.internalCode}] -> ${mainTenant.name} (${month}/${year})`);
  }
}