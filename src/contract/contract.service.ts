import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException, 
  BadRequestException,
  InternalServerErrorException,
  ConflictException
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
 * @description Gestión de arrendamientos. Implementa creación atómica y blindaje total.
 * @version 1.0.2
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
   * @description Resuelve errores 2322 y 2769 mediante asignación condicional limpia.
   */
  async create(companyId: string, dto: CreateContractDto, role: CompanyRole): Promise<Contract> {
    this.checkWriteAccess(role);

    const inmueble = await this.propertyRepo.findOneBy({ id: dto.propertyId, companyId });
    if (!inmueble) throw new NotFoundException('Inmueble no localizado.');

    const inquilinos = await this.tenantRepo.findBy({ 
      id: In(dto.inquilinosIds), 
      companyId 
    });
    if (inquilinos.length !== dto.inquilinosIds.length) {
      throw new BadRequestException('Inquilinos no válidos o de otra empresa.');
    }

    const taxIva = await this.taxRepo.findOneBy({ id: dto.taxIvaId, companyId });
    if (!taxIva) throw new NotFoundException('IVA no localizado.');

    // Corrección error 2322: No inicializar a null si la entidad espera Tax | undefined
    let taxIrpf: Tax | undefined;
    if (dto.taxIrpfId) {
      const foundIrpf = await this.taxRepo.findOneBy({ id: dto.taxIrpfId, companyId });
      if (!foundIrpf) throw new NotFoundException('IRPF no localizado.');
      taxIrpf = foundIrpf;
    }

    // Corrección error 2769: DeepPartial requiere objetos definidos
    const contract = this.contractRepo.create({
      ...dto,
      companyId,
      inmueble,
      inquilinos,
      iva: taxIva,
      retencion: taxIrpf, // Ahora es Tax o undefined, no null
    });

    try {
      return await this.contractRepo.save(contract);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * @method findAll
   * @description Asegura el retorno de Array para evitar error 2740.
   */
  async findAll(companyId: string): Promise<Contract[]> {
    return await this.contractRepo.find({
      where: { companyId, isActive: true },
      relations: ['inmueble', 'inquilinos', 'iva', 'retencion'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string, companyId: string): Promise<Contract> {
    const contract = await this.contractRepo.findOne({
      where: { id, companyId },
      relations: ['inmueble', 'inquilinos', 'iva', 'retencion'],
    });

    if (!contract) throw new NotFoundException('Contrato no localizado.');
    return contract;
  }

  async update(id: string, companyId: string, dto: UpdateContractDto, role: CompanyRole): Promise<Contract> {
    this.checkWriteAccess(role);
    const contract = await this.findOne(id, companyId);

    // Mapeo manual de relaciones si vienen en el DTO para evitar errores de DeepPartial
    if (dto.taxIvaId) {
      contract.iva = await this.taxRepo.findOneByOrFail({ id: dto.taxIvaId, companyId });
    }

    const updated = this.contractRepo.merge(contract, dto);

    try {
      return await this.contractRepo.save(updated);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string, companyId: string, role: CompanyRole): Promise<void> {
    this.checkWriteAccess(role);
    const contract = await this.findOne(id, companyId);

    contract.isActive = false;
    contract.deletedAt = new Date();

    await this.contractRepo.save(contract);
  }

  private checkWriteAccess(role: CompanyRole): void {
    if (role !== CompanyRole.OWNER) {
      throw new ForbiddenException('Solo el OWNER puede gestionar contratos.');
    }
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') throw new ConflictException('Contrato duplicado.');
    throw new InternalServerErrorException('Error en la operación del contrato.');
  }
}