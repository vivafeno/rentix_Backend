import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual, MoreThanOrEqual, Not, DataSource, EntityManager, DeepPartial } from 'typeorm';

import { Contract } from './entities/contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { CompanyRole } from 'src/user-company-role/enums/user-company-role.enum';
import { Property } from 'src/property/entities/property.entity';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { Tax } from 'src/tax/entities/tax.entity';
import { ContractStatus } from './enums';

/**
 * @class ContractService
 * @description Orquestador de lógica de negocio contractual.
 * Implementa el patrón Unit of Work mediante transacciones atómicas para asegurar
 * la integridad de los datos financieros y patrimoniales.
 */
@Injectable()
export class ContractService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Contract) private readonly contractRepo: Repository<Contract>,
    @InjectRepository(Property) private readonly propertyRepo: Repository<Property>,
    @InjectRepository(Tenant) private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(Tax) private readonly taxRepo: Repository<Tax>,
  ) {}

  /**
   * @method create
   * @description Alta de contrato con validación de disponibilidad y vinculación de activos.
   * Utiliza una transacción para garantizar que no se creen contratos con relaciones rotas.
   */
  async create(companyId: string, dto: CreateContractDto, role: CompanyRole): Promise<Contract> {
    this.checkWriteAccess(role);

    return await this.dataSource.transaction(async (manager: EntityManager) => {
      // 1. Validar disponibilidad del inmueble (dentro de la transacción)
      await this.validatePropertyAvailability(dto.propertyId, dto.startDate, dto.endDate, undefined, manager);

      // 2. Hidratación concurrente de dependencias
      const [property, tenants, taxIva] = await Promise.all([
        manager.findOneBy(Property, { id: dto.propertyId, companyId, isActive: true }),
        manager.findBy(Tenant, { id: In(dto.tenantIds), companyId, isActive: true }),
        manager.findOneBy(Tax, { id: dto.taxIvaId, companyId }),
      ]);

      if (!property) throw new NotFoundException('Inmueble no localizado o inactivo.');
      if (tenants.length !== dto.tenantIds.length) throw new BadRequestException('Uno o más inquilinos no son válidos.');
      if (!taxIva) throw new NotFoundException('IVA no localizado en el sistema.');

      const taxIrpf = dto.taxIrpfId 
        ? await manager.findOneBy(Tax, { id: dto.taxIrpfId, companyId }) 
        : null;

      // 3. Extracción de IDs para evitar colisiones de tipado (Resolución Error TS2769)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { tenantIds, taxIvaId, taxIrpfId, propertyId, ...cleanDto } = dto;

      // 4. Construcción de objeto con tipado DeepPartial explícito
      const contractData: DeepPartial<Contract> = {
        ...cleanDto,
        companyId,
        property,
        tenants,
        taxIva,
        taxIrpf: taxIrpf ?? undefined,
        status: dto.status || ContractStatus.DRAFT,
        isActive: true,
      };

      const contract = manager.create(Contract, contractData);

      try {
        return await manager.save(contract);
      } catch (e) {
        throw this.handleDBExceptions(e);
      }
    });
  }

  /**
   * @method update
   * @description Actualización selectiva de condiciones contractuales y fiscales.
   */
  async update(id: string, companyId: string, dto: UpdateContractDto, role: CompanyRole): Promise<Contract> {
    this.checkWriteAccess(role);
    const contract = await this.findOne(id, companyId);

    if (dto.taxIrpfId) {
      const foundIrpf = await this.taxRepo.findOneBy({ id: dto.taxIrpfId, companyId });
      if (!foundIrpf) throw new NotFoundException('IRPF no localizado.');
      contract.taxIrpf = foundIrpf;
    }

    const updated = this.contractRepo.merge(contract, dto);
    try {
      return await this.contractRepo.save(updated);
    } catch (e) {
      throw this.handleDBExceptions(e);
    }
  }

  /**
   * @method restore
   * @description Recupera un contrato de borrado lógico tras validar disponibilidad de fechas.
   */
  async restore(id: string, companyId: string, role: CompanyRole): Promise<Contract> {
    this.checkWriteAccess(role);
    const contract = await this.contractRepo.findOne({ where: { id, companyId }, withDeleted: true });

    if (!contract) throw new NotFoundException('Contrato no encontrado.');
    if (contract.isActive) throw new BadRequestException('El contrato ya se encuentra activo.');

    await this.validatePropertyAvailability(
      contract.propertyId, 
      contract.startDate.toISOString(), 
      contract.endDate.toISOString(), 
      contract.id
    );

    Object.assign(contract, { isActive: true, deletedAt: null, status: ContractStatus.DRAFT });
    return await this.contractRepo.save(contract);
  }

  /**
   * @method remove
   * @description Borrado lógico (Soft Delete) y cancelación de estado.
   */
  async remove(id: string, companyId: string, role: CompanyRole): Promise<void> {
    this.checkWriteAccess(role);
    const contract = await this.findOne(id, companyId);
    
    Object.assign(contract, { 
      isActive: false, 
      deletedAt: new Date(), 
      status: ContractStatus.CANCELLED 
    });
    
    await this.contractRepo.save(contract);
  }

  /**
   * @method findAll
   * @description Lista contratos activos del contexto empresarial.
   */
  async findAll(companyId: string): Promise<Contract[]> {
    return await this.contractRepo.find({
      where: { companyId, isActive: true },
      relations: ['property', 'tenants', 'taxIva', 'taxIrpf'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * @method findOne
   * @description Obtiene detalle hidratado de un contrato específico.
   */
  async findOne(id: string, companyId: string): Promise<Contract> {
    const contract = await this.contractRepo.findOne({
      where: { id, companyId },
      relations: ['property', 'tenants', 'taxIva', 'taxIrpf'],
    });
    if (!contract || (!contract.isActive && contract.deletedAt)) {
      throw new NotFoundException('Contrato no localizado o inaccesible.');
    }
    return contract;
  }

  /**
   * @method validatePropertyAvailability
   * @description Rigor de prevención de solapamiento de arrendamientos.
   */
  private async validatePropertyAvailability(
    propertyId: string, 
    start: string, 
    end: string, 
    excludeId?: string, 
    manager?: EntityManager
  ): Promise<void> {
    const repo = manager ? manager.getRepository(Contract) : this.contractRepo;
    const overlapping = await repo.findOne({
      where: {
        propertyId,
        status: ContractStatus.ACTIVE,
        isActive: true,
        startDate: LessThanOrEqual(new Date(end)),
        endDate: MoreThanOrEqual(new Date(start)),
        ...(excludeId && { id: Not(excludeId) })
      }
    });
    if (overlapping) throw new ConflictException('El inmueble ya cuenta con un contrato activo en el periodo solicitado.');
  }

  /**
   * @method checkWriteAccess
   * @description Validación de privilegios administrativos.
   */
  private checkWriteAccess(role: CompanyRole): void {
    if (role !== CompanyRole.OWNER) throw new ForbiddenException('Privilegios de edición insuficientes para esta operación.');
  }

  /**
   * @method handleDBExceptions
   * @description Centralización de errores de persistencia.
   */
  private handleDBExceptions(error: any): never {
    if (error instanceof HttpException) throw error;
    if (error.code === '23505') throw new ConflictException('Se ha detectado una duplicidad de datos en el sistema.');
    throw new InternalServerErrorException('Error crítico en el motor de persistencia contractual.');
  }
}