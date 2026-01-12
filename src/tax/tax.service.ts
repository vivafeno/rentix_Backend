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

  async create(createTaxDto: CreateTaxDto): Promise<Tax> {
    const tax = this.taxRepository.create(createTaxDto);
    return await this.taxRepository.save(tax);
  }

  async findAll(): Promise<Tax[]> {
    return await this.taxRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Tax> {
    const tax = await this.taxRepository.findOneBy({ id });
    if (!tax) {
      throw new NotFoundException(`Impuesto con ID ${id} no encontrado`);
    }
    return tax;
  }

  async update(id: string, updateTaxDto: UpdateTaxDto): Promise<Tax> {
    const tax = await this.findOne(id);
    const updatedTax = this.taxRepository.merge(tax, updateTaxDto);
    return await this.taxRepository.save(updatedTax);
  }

  async remove(id: string): Promise<void> {
    const tax = await this.findOne(id);
    // Realizamos borrado lógico para mantener integridad en facturas históricas
    await this.taxRepository.save({ ...tax, isActive: false });
  }

  /**
   * Método de utilidad para validar la existencia de impuestos
   * Útil cuando estemos creando conceptos o contratos
   */
  async validateTaxExists(id: string): Promise<boolean> {
    const count = await this.taxRepository.count({ where: { id, isActive: true } });
    return count > 0;
  }
}