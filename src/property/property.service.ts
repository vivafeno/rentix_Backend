import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { AddressStatus } from 'src/address/enums/address-status.enum';
import { AddressType } from 'src/address/enums/address-type.enum';
import { CompanyRole } from 'src/user-company-role/enums/user-company-role.enum';
import { AppRole } from 'src/auth/enums/user-global-role.enum';

/**
 * @class PropertyService
 * @description Motor de gestión de activos inmobiliarios.
 * Implementa el ciclo de vida unificado (Activo/Inactivo) sin redundancia de papelera.
 * @author Rentix 2026
 */
@Injectable()
export class PropertyService {
  private readonly logger = new Logger(PropertyService.name);

  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
  ) { }

  /**
   * @method findAll
   * @description Lista activos. El Superadmin ve incluso los inactivos (borrados lógicos).
   */
  async findAll(companyId: string, appRole: AppRole): Promise<Property[]> {
    const isSA = appRole === AppRole.SUPERADMIN;

    return await this.propertyRepo.find({
      where: { companyId },
      relations: ['address'],
      withDeleted: isSA, // El SA ve la radiografía completa del patrimonio
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * @method findOne
   * @description Localiza un activo asegurando pertenencia al Tenant.
   */
  async findOne(id: string, companyId: string, appRole: AppRole): Promise<Property> {
    const isSA = appRole === AppRole.SUPERADMIN;

    const property = await this.propertyRepo.findOne({
      where: { id, companyId },
      relations: ['address'],
      withDeleted: isSA,
    });

    if (!property) {
      throw new NotFoundException(`Activo [${id}] no localizado.`);
    }

    return property;
  }

  /**
   * @method create
   * @description Alta atómica. No requiere lógica de borrado, nace activo.
   */
async create(companyId: string, createDto: CreatePropertyDto): Promise<Property> {
    // 1. Extraemos 'address' y el resto de datos
    const { address, ...propertyData } = createDto;

    // 2. Extraemos 'type' de address porque tu entidad Address no lo reconoce
    // Esto limpia el objeto address de campos "fantasma"
    const { type, ...addressData } = address as any;

    // 3. Construimos el objeto literal con cuidado quirúrgico
    const propertyPayload: any = {
      ...propertyData,
      // Si 'company' da error, es que tu entidad espera 'companyId' directamente
      companyId: companyId, 
      address: {
        ...addressData,
        companyId: companyId,
        status: AddressStatus.ACTIVE,
        isDefault: true,
        // Eliminamos el campo 'type' si causa conflicto, o lo dejamos fuera
      },
    };

    // 4. Usamos el repositorio
    const property = this.propertyRepo.create(propertyPayload as Property);

    try {
      return await this.propertyRepo.save(property);
    } catch (error: unknown) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * @method update
   * @description Actualización parcial. Si el activo está inactivo, solo el SA puede editarlo.
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
    this.propertyRepo.merge(property, data);

    if (address && property.address) {
      Object.assign(property.address, address);
    }

    try {
      return await this.propertyRepo.save(property);
    } catch (error: unknown) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * @method toggleStatus
   * @description El ÚNICO método para dar de baja o reactivar. 
   * Sincroniza isActive con el borrado lógico (deletedAt).
   */
  async toggleStatus(
    id: string,
    companyId: string,
    activate: boolean,
    companyRole: CompanyRole
  ): Promise<Property> {
    const property = await this.findOne(id, companyId, AppRole.SUPERADMIN);

    if (companyRole !== CompanyRole.OWNER) {
      throw new ForbiddenException('Solo el propietario legal puede cambiar el estado operativo.');
    }

    property.isActive = activate;
    property.deletedAt = activate ? null : new Date();

    return await this.propertyRepo.save(property);
  }

  private handleDBExceptions(error: unknown): never {
    const dbError = error as { code?: string; detail?: string };
    if (dbError.code === '23505') {
      const detail = dbError.detail?.toLowerCase() || '';
      if (detail.includes('internal_code')) throw new ConflictException('Código interno duplicado.');
      if (detail.includes('cadastral_reference')) throw new ConflictException('Referencia catastral ya registrada.');
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Error de persistencia en Property.');
  }
}