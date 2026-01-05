import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WithholdingRate } from './withholding-rate.entity';
import { CreateWithholdingRateDto, UpdateWithholdingRateDto } from './dto';

@Injectable()
export class WithholdingRateService {
  constructor(
    @InjectRepository(WithholdingRate)
    private readonly withholdingRepo: Repository<WithholdingRate>,
  ) {}

  /* ─────────────────────────────────────
   * Crear retención
   * ───────────────────────────────────── */
  async create(
    dto: CreateWithholdingRateDto,
  ): Promise<WithholdingRate> {
    if (dto.isDefault) {
      const existingDefault = await this.withholdingRepo.findOne({
        where: {
          countryCode: dto.countryCode,
          isDefault: true,
          isActive: true,
        },
      });

      if (existingDefault) {
        throw new ConflictException(
          'Ya existe una retención por defecto para este país',
        );
      }
    }

    const rate = this.withholdingRepo.create(dto);
    return this.withholdingRepo.save(rate);
  }

  /* ─────────────────────────────────────
   * Listar retenciones por país
   * ───────────────────────────────────── */
  async findAll(
    countryCode: string,
    options?: { includeInactive?: boolean },
  ): Promise<WithholdingRate[]> {
    return this.withholdingRepo.find({
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
   * Obtener retención concreta
   * ───────────────────────────────────── */
  async findOne(id: string): Promise<WithholdingRate | null> {
    return this.withholdingRepo.findOne({ where: { id } });
  }

  /* ─────────────────────────────────────
   * Actualizar retención
   * ───────────────────────────────────── */
  async update(
    id: string,
    dto: UpdateWithholdingRateDto,
  ): Promise<WithholdingRate | null> {
    const rate = await this.withholdingRepo.findOne({ where: { id } });
    if (!rate) return null;

    if (dto.isDefault === true && !rate.isDefault) {
      await this.withholdingRepo.update(
        {
          countryCode: rate.countryCode,
          isDefault: true,
        },
        { isDefault: false },
      );
    }

    Object.assign(rate, dto);
    return this.withholdingRepo.save(rate);
  }

  /* ─────────────────────────────────────
   * Soft delete
   * ───────────────────────────────────── */
  async deactivate(id: string): Promise<boolean> {
    const rate = await this.withholdingRepo.findOne({
      where: { id, isActive: true },
    });

    if (!rate) return false;

    rate.isActive = false;
    rate.isDefault = false;

    await this.withholdingRepo.save(rate);
    return true;
  }
}
