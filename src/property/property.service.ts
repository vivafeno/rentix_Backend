import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';

import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { AddressStatus } from 'src/address/enums/addressStatus.enum';
import { AddressType } from 'src/address/enums/addressType.enum';
import { CompanyRole } from 'src/user-company-role/enums/companyRole.enum';

/**
 * @class PropertyService
 * @description Gestión integral de activos inmobiliarios.
 * Implementa persistencia atómica y aislamiento multi-tenant.
 * @author Rentix 2026
 * @version 2.5.1
 */
@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
  ) {}

  /**
   * @method findAll
   * @description Lista activos operativos filtrados por organización.
   */
  async findAll(companyId: string): Promise<Property[]> {
    return await this.propertyRepo.find({
      where: { companyId, deletedAt: IsNull() },
      relations: ['address'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * @method findTrash
   * @description Recupera activos en borrado lógico para posible restauración.
   */
  async findTrash(companyId: string): Promise<Property[]> {
    return await this.propertyRepo.find({
      where: {
        companyId,
        deletedAt: Not(IsNull()),
      },
      withDeleted: true,
      relations: ['address'],
      order: { deletedAt: 'DESC' },
    });
  }

  /**
   * @method findOne
   * @description Localiza un activo y su dirección vinculada.
   */
  async findOne(id: string, companyId: string): Promise<Property> {
    const property = await this.propertyRepo.findOne({
      where: { id, companyId },
      relations: ['address'],
      withDeleted: true,
    });

    if (!property) {
      throw new NotFoundException(
        `Activo inmobiliario con ID ${id} no localizado en este patrimonio.`,
      );
    }
    return property;
  }

  /**
   * @method create
   * @description Creación atómica de Inmueble y Dirección (Cascada habilitada en Entity).
   */
  async create(
    companyId: string,
    createDto: CreatePropertyDto,
  ): Promise<Property> {
    const { address, ...propertyData } = createDto;

    if (!propertyData.superficieConstruida || !propertyData.superficieUtil) {
      throw new ConflictException(
        'Las métricas de superficie son obligatorias para el inventario.',
      );
    }

    const property = this.propertyRepo.create({
      ...propertyData,
      companyId,
      address: {
        ...address,
        companyId,
        status: AddressStatus.ACTIVE,
        isDefault: true,
        type: AddressType.PROPERTY,
      },
    });

    try {
      return await this.propertyRepo.save(property);
    } catch (error: unknown) {
      return this.handleDBExceptions(error);
    }
  }

  /**
   * @method update
   * @description Actualización parcial. Si se incluye 'address', se actualiza en cascada.
   */
  async update(
    id: string,
    companyId: string,
    updateDto: UpdatePropertyDto,
  ): Promise<Property> {
    const property = await this.findOne(id, companyId);

    if (property.deletedAt) {
      throw new ConflictException(
        'No se puede modificar un activo que reside en la papelera.',
      );
    }

    const { address, ...data } = updateDto;
    Object.assign(property, data);

    if (address && property.address) {
      Object.assign(property.address, address);
    }

    try {
      return await this.propertyRepo.save(property);
    } catch (error: unknown) {
      return this.handleDBExceptions(error);
    }
  }

  /**
   * @method remove
   * @description Soft-delete restringido al OWNER del patrimonio.
   */
  async remove(
    id: string,
    companyId: string,
    companyRole: CompanyRole,
  ): Promise<Property> {
    const property = await this.findOne(id, companyId);

    if (companyRole !== CompanyRole.OWNER) {
      throw new ForbiddenException(
        'Privilegios insuficientes: Solo el PROPIETARIO puede eliminar activos.',
      );
    }

    if (property.deletedAt) {
      throw new ConflictException('El activo ya se encuentra en la papelera.');
    }

    property.deletedAt = new Date();
    return await this.propertyRepo.save(property);
  }

  /**
   * @method restore
   * @description Recuperación de activos para el catálogo operativo.
   */
  async restore(
    id: string,
    companyId: string,
    companyRole: CompanyRole,
  ): Promise<Property> {
    const property = await this.findOne(id, companyId);

    if (!property.deletedAt) {
      throw new ConflictException('El activo ya se encuentra operativo.');
    }

    if (companyRole !== CompanyRole.OWNER) {
      throw new ForbiddenException(
        'Operación restringida: Se requiere rol PROPIETARIO.',
      );
    }

    property.deletedAt = null;
    return await this.propertyRepo.save(property);
  }

  /**
   * @private
   * @method handleDBExceptions
   * @description Mapeo de errores técnicos a excepciones semánticas.
   * Resuelve errores de linter 207-213 mediante casting de error de Postgres.
   */
  private handleDBExceptions(error: unknown): never {
    const dbError = error as { code?: string; detail?: string };

    if (dbError.code === '23505') {
      const detail = dbError.detail?.toLowerCase() || '';
      if (detail.includes('codigo_interno')) {
        throw new ConflictException(
          'El código interno ya está registrado en este patrimonio.',
        );
      }
      if (detail.includes('referencia_catastral')) {
        throw new ConflictException(
          'Esta referencia catastral ya existe en el sistema.',
        );
      }
    }

    throw new InternalServerErrorException(
      'Error en el procesamiento del activo. Revise logs del sistema.',
    );
  }
}
