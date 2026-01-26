import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

import { Tax } from './entities/tax.entity';
import { CreateTaxDto, UpdateTaxDto } from './dto'; // Importación vía barril
import { CompanyRole } from 'src/user-company-role/enums/user-company-role.enum';

/**
 * @class TaxService
 * @description Gestión de tipos impositivos alineada con Verifactu.
 */
@Injectable()
export class TaxService {
  constructor(
    @InjectRepository(Tax)
    private readonly taxRepo: Repository<Tax>,
  ) {}

  async create(companyId: string, dto: CreateTaxDto, role: CompanyRole): Promise<Tax> {
    this.checkWriteAccess(role);

    if (dto.percentage === 0 && !dto.exemptionCause) {
      throw new BadRequestException(
        'Las normativas de Verifactu exigen una causa de exención para impuestos al 0%.',
      );
    }

    const tax = this.taxRepo.create({
      ...dto,
      companyId,
      isActive: true,
    });

    try {
      return await this.taxRepo.save(tax);
    } catch (error: unknown) {
      throw this.handleDBExceptions(error);
    }
  }

  async findAll(companyId: string): Promise<Tax[]> {
    return await this.taxRepo.find({
      where: { companyId, deletedAt: IsNull() },
      order: { percentage: 'ASC' },
    });
  }

  async findOne(id: string, companyId: string): Promise<Tax> {
    const tax = await this.taxRepo.findOne({
      where: { id, companyId },
      withDeleted: true,
    });

    if (!tax) throw new NotFoundException(`El registro fiscal [${id}] no existe.`);
    return tax;
  }

  async update(id: string, companyId: string, dto: UpdateTaxDto, role: CompanyRole): Promise<Tax> {
    this.checkWriteAccess(role);
    const tax = await this.findOne(id, companyId);
    
    const updated = this.taxRepo.merge(tax, dto);
    
    try {
      return await this.taxRepo.save(updated);
    } catch (error: unknown) {
      throw this.handleDBExceptions(error);
    }
  }

  /**
   * @method restore
   * @description Reactiva un impuesto borrado lógicamente.
   */
  async restore(id: string, companyId: string, role: CompanyRole): Promise<Tax> {
    this.checkWriteAccess(role);
    
    const tax = await this.findOne(id, companyId);
    if (!tax.deletedAt) return tax;

    tax.deletedAt = null;
    tax.isActive = true;

    return await this.taxRepo.save(tax);
  }

  async remove(id: string, companyId: string, role: CompanyRole): Promise<Tax> {
    this.checkWriteAccess(role);
    const tax = await this.findOne(id, companyId);
    
    tax.deletedAt = new Date();
    tax.isActive = false;
    
    return await this.taxRepo.save(tax);
  }

  private checkWriteAccess(role: CompanyRole): void {
    if (role !== CompanyRole.OWNER) {
      throw new ForbiddenException('Acceso Denegado: Solo el OWNER gestiona impuestos.');
    }
  }

  private handleDBExceptions(error: unknown): never {
    const dbError = error as { code?: string };
    if (dbError.code === '23505') {
      throw new ConflictException('Ya existe una regla fiscal idéntica.');
    }
    throw new InternalServerErrorException('Error de persistencia fiscal.');
  }
}