import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';

import { Tax } from './entities/tax.entity';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { TaxType } from './enums/tax-type.enum';
import { CompanyRole } from 'src/user-company-role/enums/companyRole.enum';

/**
 * @class TaxService
 * @description Gestión de tipos impositivos con validación Veri*factu.
 * @version 2026.2.1
 */
@Injectable()
export class TaxService {
  constructor(
    @InjectRepository(Tax)
    private readonly taxRepo: Repository<Tax>,
  ) {}

  /**
   * @method create
   * @description Registra un impuesto. Soluciona el error de tipado del Enum 'tipo'.
   */
  async create(companyId: string, dto: CreateTaxDto): Promise<Tax> {
    if (dto.porcentaje === 0 && !dto.causaExencion) {
      throw new BadRequestException('Facturas exentas requieren Causa de Exención.');
    }

    // Resolvemos el error 2769: Casteo explícito al tipo del Enum
    const taxType = dto.tipo as TaxType;
    const codigoFacturae = dto.codigoFacturae || this.mapFacturaECode(taxType);
    const esRetencion = taxType === TaxType.IRPF ? true : (dto.esRetencion ?? false);

    const tax = this.taxRepo.create({
      ...dto,
      tipo: taxType, // Tipado corregido
      companyId,
      codigoFacturae,
      esRetencion,
    });

    try {
      return await this.taxRepo.save(tax);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * @method findAll
   * @description Corregido error 2740: Aseguramos el retorno de Array.
   */
  async findAll(companyId: string): Promise<Tax[]> {
    return await this.taxRepo.find({
      where: { companyId, deletedAt: IsNull() },
      order: { porcentaje: 'ASC' },
    });
  }

  async findAllDeleted(companyId: string): Promise<Tax[]> {
    return await this.taxRepo.find({
      where: { companyId, deletedAt: Not(IsNull()) },
      withDeleted: true,
    });
  }

  async findOne(id: string, companyId: string): Promise<Tax> {
    const tax = await this.taxRepo.findOne({
      where: { id, companyId },
      withDeleted: true,
    });

    if (!tax) throw new NotFoundException('Impuesto no localizado.');
    return tax;
  }

  async update(id: string, companyId: string, dto: UpdateTaxDto): Promise<Tax> {
    const tax = await this.findOne(id, companyId);
    
    // Si se actualiza el tipo, asegurar el casteo
    if (dto.tipo) {
      tax.tipo = dto.tipo as TaxType;
    }
    
    Object.assign(tax, dto);

    try {
      return await this.taxRepo.save(tax);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * @method remove
   * @description Corregido error 2339: CompanyRole solo tiene OWNER, TENANT, VIEWER.
   */
  async remove(id: string, companyId: string, role: CompanyRole): Promise<Tax> {
    // Blindaje Total: Solo el dueño del patrimonio gestiona impuestos
    if (role !== CompanyRole.OWNER) {
      throw new ForbiddenException('Solo el OWNER puede eliminar impuestos.');
    }

    const tax = await this.findOne(id, companyId);
    tax.deletedAt = new Date();
    return await this.taxRepo.save(tax);
  }

  /**
   * @method restore
   */
  async restore(id: string, companyId: string, role: CompanyRole): Promise<Tax> {
    if (role !== CompanyRole.OWNER) {
      throw new ForbiddenException('Solo el OWNER puede restaurar impuestos.');
    }

    const tax = await this.findOne(id, companyId);
    tax.deletedAt = null;
    return await this.taxRepo.save(tax);
  }

  private mapFacturaECode(type: TaxType): string {
    const mapping: Record<TaxType, string> = {
      [TaxType.IVA]: '01',
      [TaxType.IRPF]: '02',
      [TaxType.IGIC]: '03',
      [TaxType.IPSI]: '04',
      [TaxType.OTRO]: '05',
    };
    return mapping[type] || '01';
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') {
      throw new ConflictException('Impuesto duplicado para esta empresa.');
    }
    throw new InternalServerErrorException('Error procesando el impuesto.');
  }
}