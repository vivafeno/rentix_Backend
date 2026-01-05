import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Contract } from './entities/contract.entity';
import { CreateContractDto, UpdateContractDto } from './dto';

import { ContractStatus } from './enums/contract-status.enum';

import { Company } from 'src/company/entities/company.entity';
import { VatRate } from 'src/common/catalogs/taxes/vat-rate/vat-rate.entity';
import { WithholdingRate } from 'src/common/catalogs/taxes/withholding-rate/withholding-rate.entity';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepo: Repository<Contract>,

    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,

    @InjectRepository(VatRate)
    private readonly vatRateRepo: Repository<VatRate>,

    @InjectRepository(WithholdingRate)
    private readonly withholdingRateRepo: Repository<WithholdingRate>,
  ) {}

  /* ─────────────────────────────────────
   * Crear contrato para una empresa
   * ───────────────────────────────────── */
  async createForCompany(
    companyId: string,
    dto: CreateContractDto,
  ): Promise<Contract> {

    /* ─────────────────────────────────────
     * 1. Validar empresa y dirección fiscal
     * ───────────────────────────────────── */
    const company = await this.companyRepo.findOne({
      where: { id: companyId, isActive: true },
      relations: ['fiscalAddress'],
    });

    if (!company) {
      throw new BadRequestException('Empresa no válida');
    }

    if (!company.fiscalAddress) {
      throw new BadRequestException(
        'La empresa no tiene dirección fiscal definida',
      );
    }

    const countryCode = company.fiscalAddress.countryCode;

    /* ─────────────────────────────────────
     * 2. Validar IVA (catálogo por país)
     * ───────────────────────────────────── */
    const vatRate = await this.vatRateRepo.findOne({
      where: {
        id: dto.vatRateId,
        isActive: true,
        countryCode,
      },
    });

    if (!vatRate) {
      throw new BadRequestException(
        'Tipo de IVA no válido para la empresa',
      );
    }

    /* ─────────────────────────────────────
     * 3. Validar retención (catálogo por país)
     * ───────────────────────────────────── */
    const withholdingRate = await this.withholdingRateRepo.findOne({
      where: {
        id: dto.withholdingRateId,
        isActive: true,
        countryCode,
      },
    });

    if (!withholdingRate) {
      throw new BadRequestException(
        'Tipo de retención no válido para la empresa',
      );
    }

    /* ─────────────────────────────────────
     * 4. Validación de coherencia temporal
     * ───────────────────────────────────── */
    const fechaInicio = new Date(dto.fechaInicio);
    const fechaFin = new Date(dto.fechaFin);

    if (fechaFin <= fechaInicio) {
      throw new BadRequestException(
        'La fecha de finalización debe ser posterior a la fecha de inicio',
      );
    }

    /* ─────────────────────────────────────
     * 5. Cálculo de revisión IPC (regla: +12 meses)
     * ───────────────────────────────────── */
    let fechaRevisionIpc: Date | undefined;

    if (dto.revisionIpcActiva) {
      if (dto.fechaRevisionIpc) {
        fechaRevisionIpc = new Date(dto.fechaRevisionIpc);
      } else {
        fechaRevisionIpc = new Date(fechaInicio);
        fechaRevisionIpc.setMonth(fechaRevisionIpc.getMonth() + 12);
      }
    }

    /* ─────────────────────────────────────
     * 6. Crear contrato
     * ───────────────────────────────────── */
    const contract = this.contractRepo.create({
      companyId,
      ...dto,
      fechaFirma: new Date(dto.fechaFirma),
      fechaInicio,
      fechaFin,
      fechaRevisionIpc,
      vatRateId: vatRate.id,
      withholdingRateId: withholdingRate.id,
    });

    return this.contractRepo.save(contract);
  }

  /* ─────────────────────────────────────
   * Listar contratos de una empresa
   * ───────────────────────────────────── */
  async findAllForCompany(
    companyId: string,
    options?: { includeInactive?: boolean },
  ): Promise<Contract[]> {
    return this.contractRepo.find({
      where: {
        companyId,
        ...(options?.includeInactive ? {} : { isActive: true }),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /* ─────────────────────────────────────
   * Obtener contrato concreto
   * ───────────────────────────────────── */
  async findOneForCompany(
    companyId: string,
    contractId: string,
  ): Promise<Contract | null> {
    return this.contractRepo.findOne({
      where: {
        id: contractId,
        companyId,
        isActive: true,
      },
    });
  }

  /* ─────────────────────────────────────
   * Actualizar contrato
   * ───────────────────────────────────── */
  async updateForCompany(
    companyId: string,
    contractId: string,
    dto: UpdateContractDto,
  ): Promise<Contract | null> {
    const contract = await this.contractRepo.findOne({
      where: {
        id: contractId,
        companyId,
      },
    });

    if (!contract) {
      return null;
    }

    /* ─────────────────────────────────────
     * Validación de fechas si se modifican
     * ───────────────────────────────────── */
    const fechaInicio = dto.fechaInicio
      ? new Date(dto.fechaInicio)
      : contract.fechaInicio;

    const fechaFin = dto.fechaFin
      ? new Date(dto.fechaFin)
      : contract.fechaFin;

    if (fechaFin <= fechaInicio) {
      throw new BadRequestException(
        'La fecha de finalización debe ser posterior a la fecha de inicio',
      );
    }

    /* ─────────────────────────────────────
     * Gestión de revisión IPC
     * ───────────────────────────────────── */
    if (dto.revisionIpcActiva === false) {
      contract.fechaRevisionIpc = undefined;
    }

    if (dto.revisionIpcActiva === true && !contract.fechaRevisionIpc) {
      const nuevaFecha = new Date(fechaInicio);
      nuevaFecha.setMonth(nuevaFecha.getMonth() + 12);
      contract.fechaRevisionIpc = nuevaFecha;
    }

    Object.assign(contract, {
      ...dto,
      fechaInicio,
      fechaFin,
      fechaFirma: dto.fechaFirma
        ? new Date(dto.fechaFirma)
        : contract.fechaFirma,
    });

    return this.contractRepo.save(contract);
  }

  /* ─────────────────────────────────────
   * Soft delete (desactivar contrato)
   * ───────────────────────────────────── */
  async softDeleteForCompany(
    companyId: string,
    contractId: string,
  ): Promise<boolean> {
    const contract = await this.contractRepo.findOne({
      where: {
        id: contractId,
        companyId,
        isActive: true,
      },
    });

    if (!contract) {
      return false;
    }

    contract.isActive = false;
    contract.estadoContrato = ContractStatus.INACTIVO;

    await this.contractRepo.save(contract);
    return true;
  }
}
