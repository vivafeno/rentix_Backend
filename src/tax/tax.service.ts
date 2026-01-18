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
 * Controla la lógica de impuestos (IVA, IRPF, IGIC) y su integridad fiscal.
 * @version 2026.2.2
 * @author Rentix
 */
@Injectable()
export class TaxService {
  constructor(
    @InjectRepository(Tax)
    private readonly taxRepo: Repository<Tax>,
  ) {}

  /**
   * @method create
   * @description Registra un nuevo impuesto validando coherencia fiscal.
   */
  async create(companyId: string, dto: CreateTaxDto): Promise<Tax> {
    if (dto.porcentaje === 0 && !dto.causaExencion) {
      throw new BadRequestException(
        'Las facturas con 0% de IVA requieren especificar una Causa de Exención según Veri*factu.',
      );
    }

    const taxType = dto.tipo as TaxType;
    const codigoFacturae = dto.codigoFacturae || this.mapFacturaECode(taxType);
    const esRetencion =
      taxType === TaxType.IRPF ? true : (dto.esRetencion ?? false);

    const tax = this.taxRepo.create({
      ...dto,
      tipo: taxType,
      companyId,
      codigoFacturae,
      esRetencion,
    });

    try {
      return await this.taxRepo.save(tax);
    } catch (error: unknown) {
      return this.handleDBExceptions(error);
    }
  }

  /**
   * @method findAll
   * @description Lista impuestos operativos filtrados por empresa.
   */
  async findAll(companyId: string): Promise<Tax[]> {
    return await this.taxRepo.find({
      where: { companyId, deletedAt: IsNull() },
      order: { porcentaje: 'ASC' },
    });
  }

  /**
   * @method findAllDeleted
   * @description Recupera el histórico de impuestos eliminados (Papelera).
   */
  async findAllDeleted(companyId: string): Promise<Tax[]> {
    return await this.taxRepo.find({
      where: { companyId, deletedAt: Not(IsNull()) },
      withDeleted: true,
      order: { deletedAt: 'DESC' },
    });
  }

  /**
   * @method findOne
   * @description Localiza un impuesto por ID con aislamiento de datos.
   */
  async findOne(id: string, companyId: string): Promise<Tax> {
    const tax = await this.taxRepo.findOne({
      where: { id, companyId },
      withDeleted: true,
    });

    if (!tax)
      throw new NotFoundException(`Impuesto con ID ${id} no localizado.`);
    return tax;
  }

  /**
   * @method update
   * @description Actualización parcial de impuestos.
   */
  async update(id: string, companyId: string, dto: UpdateTaxDto): Promise<Tax> {
    const tax = await this.findOne(id, companyId);

    if (dto.tipo) {
      tax.tipo = dto.tipo as TaxType;
    }

    Object.assign(tax, dto);

    try {
      return await this.taxRepo.save(tax);
    } catch (error: unknown) {
      return this.handleDBExceptions(error);
    }
  }

  /**
   * @method remove
   * @description Soft-delete restringido al OWNER del patrimonio.
   */
  async remove(id: string, companyId: string, role: CompanyRole): Promise<Tax> {
    if (role !== CompanyRole.OWNER) {
      throw new ForbiddenException(
        'Privilegios insuficientes: Solo el OWNER gestiona la política fiscal.',
      );
    }

    const tax = await this.findOne(id, companyId);
    tax.deletedAt = new Date();
    return await this.taxRepo.save(tax);
  }

  /**
   * @method restore
   * @description Reactiva un impuesto eliminado.
   */
  async restore(
    id: string,
    companyId: string,
    role: CompanyRole,
  ): Promise<Tax> {
    if (role !== CompanyRole.OWNER) {
      throw new ForbiddenException(
        'Operación denegada: Se requiere rol OWNER.',
      );
    }

    const tax = await this.findOne(id, companyId);
    tax.deletedAt = null;
    return await this.taxRepo.save(tax);
  }

  /**
   * @private
   * @method mapFacturaECode
   * @description Mapeo de códigos oficiales de la AEAT para FacturaE.
   */
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

  /**
   * @private
   * @method handleDBExceptions
   * @description Procesa excepciones de integridad con tipado seguro.
   * Resuelve el error de linter en la línea 151.
   */
  private handleDBExceptions(error: unknown): never {
    const dbError = error as { code?: string };

    if (dbError.code === '23505') {
      throw new ConflictException(
        'Ya existe un impuesto registrado con esos parámetros para esta empresa.',
      );
    }

    throw new InternalServerErrorException(
      'Error de persistencia en el módulo fiscal.',
    );
  }
}
