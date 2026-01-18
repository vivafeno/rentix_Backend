import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { CreateBillingConceptDto } from './dto/create-billing-concept.dto';
import { UpdateBillingConceptDto } from './dto/update-billing-concept.dto';
import { BillingConcept } from './entities/billing-concept.entity';
import { Tax } from '../tax/entities/tax.entity';

@Injectable()
export class BillingConceptService {
  constructor(
    @InjectRepository(BillingConcept)
    private readonly conceptRepository: Repository<BillingConcept>,
  ) {}

  async create(dto: CreateBillingConceptDto): Promise<BillingConcept> {
    // Construimos el objeto de forma que TypeORM lo entienda perfectamente
    const conceptData: DeepPartial<BillingConcept> = {
      name: dto.name,
      label: dto.label,
      defaultPrice: dto.defaultPrice,
      requiresPeriod: dto.requiresPeriod,
      isUniquePerPeriod: dto.isUniquePerPeriod,
      itemType: dto.itemType,
      // Asignamos el objeto con el ID, no solo el string
      defaultTax: { id: dto.defaultTaxId } as Tax,
      // Manejamos el opcional evitando el null si no viene
      ...(dto.defaultRetentionId && {
        defaultRetention: { id: dto.defaultRetentionId } as Tax,
      }),
    };

    const concept = this.conceptRepository.create(conceptData);
    return await this.conceptRepository.save(concept);
  }

  async findAll(): Promise<BillingConcept[]> {
    return await this.conceptRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<BillingConcept> {
    const concept = await this.conceptRepository.findOne({
      where: { id },
    });
    if (!concept) throw new NotFoundException(`Concepto ${id} no encontrado`);
    return concept;
  }

  async update(
    id: string,
    dto: UpdateBillingConceptDto,
  ): Promise<BillingConcept> {
    const concept = await this.findOne(id);

    // Preparamos los datos de actualización
    const updateData: DeepPartial<BillingConcept> = { ...dto };

    if (dto.defaultTaxId) {
      updateData.defaultTax = { id: dto.defaultTaxId } as Tax;
    }

    if (dto.defaultRetentionId) {
      updateData.defaultRetention = { id: dto.defaultRetentionId } as Tax;
    }

    const merged = this.conceptRepository.merge(concept, updateData);
    return await this.conceptRepository.save(merged);
  }

  async remove(id: string): Promise<void> {
    const concept = await this.findOne(id);
    await this.conceptRepository.softRemove(concept);
  }

  async getCatalogList(): Promise<Partial<BillingConcept>[]> {
    return await this.conceptRepository.find({
      select: {
        id: true,
        name: true,
        label: true,
        defaultPrice: true,
      },
    });
  }
}
