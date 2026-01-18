import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Contract } from './entities/contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { CompanyRole } from 'src/user-company-role/enums/companyRole.enum';
import { Property } from 'src/property/entities/property.entity';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { Tax } from 'src/tax/entities/tax.entity';

/**
 * @class ContractService
 * @description Gestión del ciclo de vida de arrendamientos.
 * Implementa validación cruzada entre Inmuebles, Inquilinos e Impuestos.
 * @version 2026.1.18
 * @author Rentix
 */
@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepo: Repository<Contract>,
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(Tax)
    private readonly taxRepo: Repository<Tax>,
  ) {}

  /**
   * @method create
   * @description Crea un contrato validando que todas las entidades relacionadas pertenezcan a la misma empresa.
   */
  async create(
    companyId: string,
    dto: CreateContractDto,
    role: CompanyRole,
  ): Promise<Contract> {
    this.checkWriteAccess(role);

    // 1. Validación de Inmueble
    const inmueble = await this.propertyRepo.findOneBy({
      id: dto.propertyId,
      companyId,
    });
    if (!inmueble) throw new NotFoundException('Inmueble no localizado.');

    // 2. Validación de Inquilinos
    const inquilinos = await this.tenantRepo.findBy({
      id: In(dto.inquilinosIds),
      companyId,
    });
    if (inquilinos.length !== dto.inquilinosIds.length) {
      throw new BadRequestException('Inquilinos no válidos o de otra empresa.');
    }

    // 3. Validación de IVA
    const taxIva = await this.taxRepo.findOneBy({
      id: dto.taxIvaId,
      companyId,
    });
    if (!taxIva) throw new NotFoundException('IVA no localizado.');

    // 4. Validación opcional de IRPF (Retención)
    let taxIrpf: Tax | undefined;
    if (dto.taxIrpfId) {
      const foundIrpf = await this.taxRepo.findOneBy({
        id: dto.taxIrpfId,
        companyId,
      });
      if (!foundIrpf) throw new NotFoundException('IRPF no localizado.');
      taxIrpf = foundIrpf;
    }

    const contract = this.contractRepo.create({
      ...dto,
      companyId,
      inmueble,
      inquilinos,
      iva: taxIva,
      retencion: taxIrpf,
    });

    try {
      return await this.contractRepo.save(contract);
    } catch (error: unknown) {
      return this.handleDBExceptions(error);
    }
  }

  /**
   * @method findAll
   * @description Lista contratos activos con sus relaciones hidratadas.
   */
  async findAll(companyId: string): Promise<Contract[]> {
    return await this.contractRepo.find({
      where: { companyId, isActive: true },
      relations: ['inmueble', 'inquilinos', 'iva', 'retencion'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * @method findOne
   * @description Recupera un contrato específico validando aislamiento por empresa.
   */
  async findOne(id: string, companyId: string): Promise<Contract> {
    const contract = await this.contractRepo.findOne({
      where: { id, companyId },
      relations: ['inmueble', 'inquilinos', 'iva', 'retencion'],
    });

    if (!contract) throw new NotFoundException('Contrato no localizado.');
    return contract;
  }

  /**
   * @method update
   * @description Actualización parcial de contratos.
   */
  async update(
    id: string,
    companyId: string,
    dto: UpdateContractDto,
    role: CompanyRole,
  ): Promise<Contract> {
    this.checkWriteAccess(role);
    const contract = await this.findOne(id, companyId);

    if (dto.taxIvaId) {
      contract.iva = await this.taxRepo.findOneByOrFail({
        id: dto.taxIvaId,
        companyId,
      });
    }

    const updated = this.contractRepo.merge(contract, dto);

    try {
      return await this.contractRepo.save(updated);
    } catch (error: unknown) {
      return this.handleDBExceptions(error);
    }
  }

  /**
   * @method remove
   * @description Borrado lógico de contrato.
   */
  async remove(
    id: string,
    companyId: string,
    role: CompanyRole,
  ): Promise<void> {
    this.checkWriteAccess(role);
    const contract = await this.findOne(id, companyId);

    contract.isActive = false;
    contract.deletedAt = new Date();

    await this.contractRepo.save(contract);
  }

  /**
   * @private
   * @method checkWriteAccess
   * @description Centraliza la validación de privilegios para mutaciones.
   */
  private checkWriteAccess(role: CompanyRole): void {
    if (role !== CompanyRole.OWNER) {
      throw new ForbiddenException(
        'Privilegios insuficientes: Solo el OWNER puede gestionar contratos.',
      );
    }
  }

  /**
   * @private
   * @method handleDBExceptions
   * @description Procesa errores de Postgres (vía TypeORM) con tipado seguro.
   * Resuelve el error de linter en la propiedad .code.
   */
  private handleDBExceptions(error: unknown): never {
    const dbError = error as { code?: string };

    if (dbError.code === '23505') {
      throw new ConflictException(
        'Conflicto: Ya existe un contrato con estos parámetros únicos.',
      );
    }

    throw new InternalServerErrorException(
      'Error de infraestructura al procesar el contrato.',
    );
  }
}
