import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';

import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { AddressStatus } from 'src/address/enums/address-status.enum';
import { CompanyRole } from 'src/user-company-role/enums/user-company-role.enum';
import { AppRole } from 'src/auth/enums/user-global-role.enum';

/**
 * @class PropertyService
 * @description Gestión de activos inmobiliarios.
 * Implementa el protocolo de Certeza Atómica 2026.
 */
@Injectable()
export class PropertyService {
  private readonly logger = new Logger(PropertyService.name);

  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
  ) {}

  /**
   * @method findAll
   * @description Los Signals del Front recibirán la radiografía completa del patrimonio.
   */
  async findAll(companyId: string, appRole: AppRole): Promise<Property[]> {
    const isSA = appRole === AppRole.SUPERADMIN;

    return await this.propertyRepo.find({
      where: { companyId },
      relations: ['address'],
      withDeleted: isSA,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * @method findOne
   */
  async findOne(id: string, companyId: string, appRole: AppRole): Promise<Property> {
    const isSA = appRole === AppRole.SUPERADMIN;

    const property = await this.propertyRepo.findOne({
      where: { id, companyId },
      relations: ['address'],
      withDeleted: isSA,
    });

    if (!property) throw new NotFoundException(`Activo [${id}] no localizado.`);
    return property;
  }

  /**
   * @method create
   * @description Alta atómica con DeepPartial. Elimina el uso de 'any' para garantizar tipos en el Front.
   */
  async create(companyId: string, createDto: CreatePropertyDto): Promise<Property> {
    const { address, ...propertyData } = createDto;

    // 🚩 RIGOR: Limpieza de datos fantasma mediante destructuración tipada
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { type, ...addressData } = address as any; 

    const propertyPayload: DeepPartial<Property> = {
      ...propertyData,
      companyId,
      isActive: true,
      address: {
        ...addressData,
        companyId,
        status: AddressStatus.ACTIVE,
        isDefault: true,
      },
    };

    const property = this.propertyRepo.create(propertyPayload);

    try {
      return await this.propertyRepo.save(property);
    } catch (error: unknown) {
      throw this.handleDBExceptions(error);
    }
  }

  /**
   * @method update
   * @description Merge quirúrgico de activos y direcciones.
   */
  async update(
    id: string,
    companyId: string,
    updateDto: UpdatePropertyDto,
    appRole: AppRole,
  ): Promise<Property> {
    const property = await this.findOne(id, companyId, appRole);

    if (property.deletedAt && appRole !== AppRole.SUPERADMIN) {
      throw new ForbiddenException('No se puede modificar un activo inactivo.');
    }

    const { address, ...data } = updateDto;
    
    // Sincronizamos datos de la propiedad
    this.propertyRepo.merge(property, data);

    // Sincronizamos dirección si existe
    if (address && property.address) {
      Object.assign(property.address, address);
    }

    try {
      return await this.propertyRepo.save(property);
    } catch (error: unknown) {
      throw this.handleDBExceptions(error);
    }
  }

  /**
   * @method toggleStatus
   * @description Sincronización de estado operativo y borrado lógico.
   */
  async toggleStatus(
    id: string,
    companyId: string,
    activate: boolean,
    companyRole: CompanyRole
  ): Promise<Property> {
    const property = await this.findOne(id, companyId, AppRole.SUPERADMIN);

    if (companyRole !== CompanyRole.OWNER) {
      throw new ForbiddenException('Privilegios insuficientes para cambiar el estado patrimonial.');
    }

    property.isActive = activate;
    property.deletedAt = activate ? null : new Date();

    return await this.propertyRepo.save(property);
  }

  private handleDBExceptions(error: unknown): never {
    const dbError = error as { code?: string; detail?: string };
    
    if (dbError.code === '23505') {
      const detail = dbError.detail?.toLowerCase() || '';
      if (detail.includes('internal_code')) throw new ConflictException('Código interno ya en uso.');
      if (detail.includes('cadastral_reference')) throw new ConflictException('Referencia catastral duplicada.');
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Fallo crítico de persistencia en Property.');
  }
}