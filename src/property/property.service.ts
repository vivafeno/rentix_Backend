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
 * Servicio de gestión de activos inmobiliarios (Properties).
 * * Estándares Blueprint 2026:
 * - Aislamiento Multi-tenant mediante companyId directo.
 * - Gestión de Soft-Delete nativo sincronizado con BaseEntity.
 * - Persistencia en cascada para la entidad Address.
 * * @version 1.2.0
 * @author Rentix
 */
@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
  ) { }

  /**
   * Recupera el listado de inmuebles operativos para una organización.
   * @param companyId Identificador de la empresa.
   */
  async findAll(companyId: string): Promise<Property[]> {
    return await this.propertyRepo.find({
      where: { companyId, deletedAt: IsNull() },
      relations: ['address'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtiene los activos alojados en la papelera de reciclaje.
   * @param companyId Identificador de la empresa.
   */
  async findTrash(companyId: string): Promise<Property[]> {
    return await this.propertyRepo.find({
      where: {
        companyId,
        deletedAt: Not(IsNull())
      },
      withDeleted: true,
      relations: ['address'],
      order: { deletedAt: 'DESC' },
    });
  }

  /**
   * Localiza un activo único validando pertenencia y permitiendo acceso a eliminados.
   * @param id UUID de la propiedad.
   * @param companyId Identificador de la empresa.
   */
  async findOne(id: string, companyId: string): Promise<Property> {
    const property = await this.propertyRepo.findOne({
      where: { id, companyId },
      relations: ['address'],
      withDeleted: true,
    });

    if (!property) {
      throw new NotFoundException(`Activo inmobiliario con ID ${id} no localizado`);
    }
    return property;
  }

  /**
   * Registra un nuevo inmueble con dirección vinculada en cascada.
   * @param companyId Identificador de la empresa propietaria.
   * @param createDto DTO de creación de propiedad.
   */
  async create(companyId: string, createDto: CreatePropertyDto): Promise<Property> {
    const { address, ...propertyData } = createDto;

    // Blueprint 2026: Validación de integridad lógica antes de persistencia
    // Esto compensa el 'nullable: true' temporal de la base de datos.
    if (!propertyData.surfaceTotal || !propertyData.surfaceUseful) {
      throw new ConflictException('Las métricas de superficie (Total y Útil) son obligatorias.');
    }

    const property = this.propertyRepo.create({
      ...propertyData,
      companyId,
      isActive: true,
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
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Actualiza los atributos de un activo y su dirección asociada.
   * @param id UUID de la propiedad.
   * @param companyId Identificador de la empresa.
   * @param updateDto DTO con cambios parciales.
   */
  async update(id: string, companyId: string, updateDto: UpdatePropertyDto): Promise<Property> {
    const property = await this.findOne(id, companyId);

    if (property.deletedAt) {
      throw new ConflictException('No se puede modificar un activo que reside en la papelera');
    }

    const { address, ...data } = updateDto;
    Object.assign(property, data);

    if (address) {
      property.address = property.address
        ? Object.assign(property.address, address)
        : (address as any);
    }

    try {
      return await this.propertyRepo.save(property);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Mueve el activo a la papelera (Borrado lógico).
   * @param id UUID de la propiedad.
   * @param companyId Identificador de la empresa.
   * @param companyRole Rol del usuario solicitante.
   */
  async remove(id: string, companyId: string, companyRole: CompanyRole): Promise<Property> {
    const property = await this.findOne(id, companyId);

    if (companyRole !== CompanyRole.OWNER) {
      throw new ForbiddenException('Privilegios insuficientes: Se requiere rol OWNER');
    }

    if (property.deletedAt) {
      throw new ConflictException('El activo ya se encuentra en la papelera');
    }

    property.isActive = false;
    property.deletedAt = new Date();

    return await this.propertyRepo.save(property);
  }

  /**
   * Restaura un activo de la papelera al estado operativo.
   * @param id UUID de la propiedad.
   * @param companyId Identificador de la empresa.
   * @param companyRole Rol del usuario solicitante.
   */
  async restore(id: string, companyId: string, companyRole: CompanyRole): Promise<Property> {
    const property = await this.findOne(id, companyId);

    if (!property.deletedAt) {
      throw new ConflictException('El activo ya se encuentra operativo');
    }

    if (companyRole !== CompanyRole.OWNER) {
      throw new ForbiddenException('Operación restringida a administradores (OWNER)');
    }

    property.isActive = true;
    property.deletedAt = null;

    return await this.propertyRepo.save(property);
  }

  /**
   * Gestiona excepciones de motor de base de datos para devolver errores semánticos.
   * @param error Objeto de error capturado.
   */
  private handleDBExceptions(error: any): never {
    if (error.code === '23505') {
      const detail = error.detail?.toLowerCase();
      if (detail?.includes('internal_code')) throw new ConflictException('El código interno ya está registrado en esta empresa');
      if (detail?.includes('cadastral_reference')) throw new ConflictException('La referencia catastral ya existe en el sistema');
    }

    console.error('Core Persistence Error:', error);
    throw new InternalServerErrorException('Error crítico en el procesamiento del activo inmobiliario');
  }
}