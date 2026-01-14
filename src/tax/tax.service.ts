import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { Tax } from './entities/tax.entity';

@Injectable()
export class TaxService {
  constructor(
    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>,
  ) {}

  async create(companyId: string, createTaxDto: CreateTaxDto): Promise<Tax> {
    const tax = this.taxRepository.create({ ...createTaxDto, companyId });
    return await this.taxRepository.save(tax);
  }

  async findAll(companyId: string): Promise<Tax[]> {
    return await this.taxRepository.find({
      where: { companyId },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, companyId: string): Promise<Tax> {
    const tax = await this.taxRepository.findOne({ where: { id, companyId } });
    if (!tax) throw new NotFoundException(`Impuesto no encontrado`);
    return tax;
  }

  async update(id: string, companyId: string, updateTaxDto: UpdateTaxDto): Promise<Tax> {
    const tax = await this.findOne(id, companyId);
    const updatedTax = this.taxRepository.merge(tax, updateTaxDto);
    return await this.taxRepository.save(updatedTax);
  }

  async remove(id: string, companyId: string): Promise<Tax> {
    const tax = await this.findOne(id, companyId);
    return await this.taxRepository.softRemove(tax);
  }
}