import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Tax } from './entities/tax.entity';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';

/**
 * Servicio de lógica de negocio para la gestión de impuestos.
 * * Estándares Blueprint 2026:
 * - Aislamiento Multi-tenant estricto por companyId.
 * - Ciclo de vida de datos mediante Soft-Delete nativo de TypeORM.
 * - Documentación técnica bajo estándar JSDoc.
 * * @version 1.2.2
 * @author Rentix
 */
@Injectable()
export class TaxService {
  constructor(
    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>,
  ) {}

  /**
   * Registra un nuevo impuesto vinculado a una empresa.
   * @param companyId UUID de la empresa propietaria.
   * @param createTaxDto Datos de configuración fiscal.
   */
  async create(companyId: string, createTaxDto: CreateTaxDto): Promise<Tax> {
    const tax = this.taxRepository.create({
      ...createTaxDto,
      companyId,
      isActive: true,
    });
    return await this.taxRepository.save(tax);
  }

  /**
   * Recupera el catálogo de impuestos activos de la empresa.
   * @param companyId UUID de la empresa.
   */
  async findAll(companyId: string): Promise<Tax[]> {
    return await this.taxRepository.find({
      where: { companyId, deletedAt: IsNull() },
      order: { name: 'ASC' },
    });
  }

  /**
   * Recupera exclusivamente los impuestos alojados en la papelera.
   * @param companyId UUID de la empresa.
   */
  async findAllDeleted(companyId: string): Promise<Tax[]> {
    return await this.taxRepository.find({
      where: { companyId, deletedAt: Not(IsNull()) },
      withDeleted: true,
      order: { deletedAt: 'DESC' },
    });
  }

  /**
   * Localiza un impuesto por ID y empresa, incluyendo registros eliminados.
   * @param id UUID del impuesto.
   * @param companyId UUID de la empresa.
   */
  async findOne(id: string, companyId: string): Promise<Tax> {
    const tax = await this.taxRepository.findOne({
      where: { id, companyId },
      withDeleted: true,
    });

    if (!tax) {
      throw new NotFoundException(`Impuesto con ID ${id} no encontrado`);
    }
    return tax;
  }

  /**
   * Actualiza los datos de un impuesto activo.
   * @param id UUID del impuesto.
   * @param companyId UUID de la empresa.
   * @param updateTaxDto Datos parciales a actualizar.
   */
  async update(id: string, companyId: string, updateTaxDto: UpdateTaxDto): Promise<Tax> {
    const tax = await this.findOne(id, companyId);
    
    if (tax.deletedAt) {
      throw new BadRequestException('No se puede editar un registro que está en la papelera');
    }

    Object.assign(tax, updateTaxDto);
    return await this.taxRepository.save(tax);
  }

  /**
   * Ejecuta el borrado lógico del registro.
   * @param id UUID del impuesto.
   * @param companyId UUID de la empresa.
   */
  async remove(id: string, companyId: string): Promise<Tax> {
    const tax = await this.findOne(id, companyId);
    
    if (tax.deletedAt) {
      throw new BadRequestException('El impuesto ya se encuentra en la papelera');
    }

    tax.isActive = false;
    // TypeORM detecta automáticamente @DeleteDateColumn al hacer save() con fecha
    tax.deletedAt = new Date(); 

    return await this.taxRepository.save(tax);
  }

  /**
   * Restaura un registro de la papelera al catálogo operativo.
   * @param id UUID del impuesto.
   * @param companyId UUID de la empresa.
   */
  async restore(id: string, companyId: string): Promise<Tax> {
    const tax = await this.findOne(id, companyId);

    if (!tax.deletedAt) {
      throw new BadRequestException('El impuesto no se encuentra en la papelera');
    }

    tax.isActive = true;
    tax.deletedAt = null; 

    return await this.taxRepository.save(tax);
  }
}