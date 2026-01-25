import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual, MoreThanOrEqual, Not } from 'typeorm';

import { Contract } from './entities/contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { CompanyRole } from 'src/user-company-role/enums/user-company-role.enum';
import { Property } from 'src/property/entities/property.entity';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { Tax } from 'src/tax/entities/tax.entity';
import { ContractStatus } from './enums';

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
   * @description Alta de contrato con validación de solapamiento y rigor fiscal.
   */
  async create(
    companyId: string,
    dto: CreateContractDto,
    role: CompanyRole,
  ): Promise<Contract> {
    this.checkWriteAccess(role);

    // 1. Rigor de Disponibilidad
    await this.validatePropertyAvailability(dto.propertyId, dto.startDate, dto.endDate);

    // 2. Hidratación de Relaciones con SoftDelete Check
    const property = await this.propertyRepo.findOneBy({ id: dto.propertyId, companyId, isActive: true });
    if (!property) throw new NotFoundException('Inmueble no localizado o inactivo.');

    const tenants = await this.tenantRepo.findBy({ id: In(dto.tenantIds), companyId, isActive: true });
    if (tenants.length !== dto.tenantIds.length) throw new BadRequestException('Inquilinos no válidos.');

    const taxIva = await this.taxRepo.findOneBy({ id: dto.taxIvaId, companyId });
    if (!taxIva) throw new NotFoundException('IVA no localizado.');

    let taxIrpf: Tax | null = null;
    if (dto.taxIrpfId) {
      taxIrpf = await this.taxRepo.findOneBy({ id: dto.taxIrpfId, companyId });
      if (!taxIrpf) throw new NotFoundException('IRPF no localizado.');
    }

    // 3. Instanciación Manual para evitar errores de DeepPartial
    const contract = new Contract();
    
    // Extraemos IDs para que no colisionen con las entidades hidratadas
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tenantIds, taxIvaId, taxIrpfId, ...plainDto } = dto;

    Object.assign(contract, {
      ...plainDto,
      companyId,
      property,
      tenants,
      taxIva,
      taxIrpf,
      status: dto.status || ContractStatus.DRAFT,
      isActive: true,
      deletedAt: null,
    });

    try {
      return await this.contractRepo.save(contract);
    } catch (error) {
      return this.handleDBExceptions(error);
    }
  }

  /**
   * @method update
   * @description Actualización selectiva de condiciones.
   */
  async update(
    id: string,
    companyId: string,
    dto: UpdateContractDto,
    role: CompanyRole,
  ): Promise<Contract> {
    this.checkWriteAccess(role);
    const contract = await this.findOne(id, companyId);

    if (dto.taxIrpfId) {
      const foundIrpf = await this.taxRepo.findOneBy({ id: dto.taxIrpfId, companyId });
      if (!foundIrpf) throw new NotFoundException('IRPF no localizado.');
      contract.taxIrpf = foundIrpf;
    }

    // merge() es seguro aquí porque UpdateContractDto ya omite propertyId/tenantIds
    const updated = this.contractRepo.merge(contract, dto);

    try {
      return await this.contractRepo.save(updated);
    } catch (error) {
      return this.handleDBExceptions(error);
    }
  }

  /**
   * @method restore
   * @description Reactiva un contrato borrado lógicamente.
   */
  async restore(id: string, companyId: string, role: CompanyRole): Promise<Contract> {
    this.checkWriteAccess(role);
    
    const contract = await this.contractRepo.findOne({
      where: { id, companyId },
      withDeleted: true // Necesario si usas el @DeleteDateColumn nativo de TypeORM
    });

    if (!contract) throw new NotFoundException('Contrato no encontrado.');
    if (contract.isActive) throw new BadRequestException('El contrato ya está activo.');

    await this.validatePropertyAvailability(
      contract.propertyId, 
      contract.startDate.toISOString(), 
      contract.endDate.toISOString(), 
      contract.id
    );

    contract.isActive = true;
    contract.deletedAt = null;
    contract.status = ContractStatus.DRAFT;

    return await this.contractRepo.save(contract);
  }

  /**
   * @method remove
   * @description Borrado lógico (Soft Delete) Rentix Style.
   */
  async remove(id: string, companyId: string, role: CompanyRole): Promise<void> {
    this.checkWriteAccess(role);
    const contract = await this.findOne(id, companyId);

    contract.isActive = false;
    contract.deletedAt = new Date();
    contract.status = ContractStatus.CANCELLED;

    await this.contractRepo.save(contract);
  }

  /* --- MÉTODOS PRIVADOS DE RIGOR --- */

  private async validatePropertyAvailability(
    propertyId: string, 
    start: string, 
    end: string, 
    excludeId?: string
  ): Promise<void> {
    const overlapping = await this.contractRepo.findOne({
      where: {
        propertyId,
        status: ContractStatus.ACTIVE,
        isActive: true,
        startDate: LessThanOrEqual(new Date(end)),
        endDate: MoreThanOrEqual(new Date(start)),
        ...(excludeId && { id: Not(excludeId) })
      }
    });
    if (overlapping) throw new ConflictException('Inmueble ocupado en esas fechas.');
  }

  async findAll(companyId: string): Promise<Contract[]> {
    return await this.contractRepo.find({
      where: { companyId, isActive: true },
      relations: ['property', 'tenants', 'taxIva', 'taxIrpf'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, companyId: string): Promise<Contract> {
    const contract = await this.contractRepo.findOne({
      where: { id, companyId },
      relations: ['property', 'tenants', 'taxIva', 'taxIrpf'],
    });
    if (!contract || (!contract.isActive && contract.deletedAt)) throw new NotFoundException('Contrato no localizado.');
    return contract;
  }

  private checkWriteAccess(role: CompanyRole): void {
    if (role !== CompanyRole.OWNER) throw new ForbiddenException('Privilegios insuficientes.');
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') throw new ConflictException('Conflicto de duplicidad.');
    throw new InternalServerErrorException('Error en el motor contractual.');
  }
}