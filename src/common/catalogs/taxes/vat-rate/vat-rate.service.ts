import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VatRate } from './vat-rate.entity';
import { CreateVatRateDto } from './dto/create-vat-rate.dto';
import { UpdateVatRateDto } from './dto/update-vat-rate.dto';

@Injectable()
export class VatRateService {
  constructor(
    @InjectRepository(VatRate)
    private readonly vatRateRepo: Repository<VatRate>,
  ) {}

  /* ─────────────────────────────────────
   * Crear tipo de IVA
   * ───────────────────────────────────── */
  async create(dto: CreateVatRateDto): Promise<VatRate> {
    /**
     * Regla: solo un IVA por defecto por país
     */
    if (dto.isDefault) {
      const existingDefault = await this.vatRateRepo.findOne({
        where: {
          countryCode: dto.countryCode,
          isDefault: true,
          isActive: true,
        },
      });

      if (existingDefault) {
        throw new ConflictException(
          'Ya existe un IVA por defecto para este país',
        );
      }
    }

    const vatRate = this.vatRateRepo.create(dto);
    return this.vatRateRepo.save(vatRate);
  }

  /* ─────────────────────────────────────
   * Listar IVAs por país
   * ───────────────────────────────────── */
  async findAll(
    countryCode: string,
    options?: { includeInactive?: boolean },
  ): Promise<VatRate[]> {
    return this.vatRateRepo.find({
      where: {
        countryCode,
        ...(options?.includeInactive ? {} : { isActive: true }),
      },
      order: {
        porcentaje: 'DESC',
      },
    });
  }

  /* ─────────────────────────────────────
   * Obtener IVA concreto
   * ───────────────────────────────────── */
  async findOne(id: string): Promise<VatRate | null> {
    return this.vatRateRepo.findOne({ where: { id } });
  }

  /* ─────────────────────────────────────
   * Actualizar IVA
   * ───────────────────────────────────── */
  async update(
    id: string,
    dto: UpdateVatRateDto,
  ): Promise<VatRate | null> {
    const vatRate = await this.vatRateRepo.findOne({ where: { id } });
    if (!vatRate) return null;

    /**
     * Si se marca como default, invalidar otros defaults del país
     */
    if (dto.isDefault === true && !vatRate.isDefault) {
      await this.vatRateRepo.update(
        {
          countryCode: vatRate.countryCode,
          isDefault: true,
        },
        { isDefault: false },
      );
    }

    Object.assign(vatRate, dto);
    return this.vatRateRepo.save(vatRate);
  }

  /* ─────────────────────────────────────
   * Soft delete
   * ───────────────────────────────────── */
  async deactivate(id: string): Promise<boolean> {
    const vatRate = await this.vatRateRepo.findOne({
      where: { id, isActive: true },
    });

    if (!vatRate) return false;

    vatRate.isActive = false;
    vatRate.isDefault = false;

    await this.vatRateRepo.save(vatRate);
    return true;
  }
}
