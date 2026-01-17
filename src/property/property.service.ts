import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { AddressStatus } from 'src/address/enums/addressStatus.enum';
import { AddressType } from 'src/address/enums/addressType.enum';
import { CompanyRole } from 'src/user-company-role/enums/companyRole.enum';

/**
 * Servicio de gestión de activos inmobiliarios (Properties).
 * Implementa lógica de aislamiento por empresa (Multitenancy) y persistencia en cascada.
 * @version 2026.1.4
 */
@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
  ) {}

  // --- MÉTODOS DE LECTURA ---

  /**
   * Recupera el listado de inmuebles activos para una organización específica.
   */
  async findAll(companyId: string): Promise<Property[]> {
    return await this.propertyRepo.find({
      where: { company: { id: companyId }, isActive: true },
      relations: ['address'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Obtiene los activos marcados como inactivos (Papelera).
   * Requiere 'withDeleted' para omitir el filtro global de TypeORM.
   */
  async findTrash(companyId: string): Promise<Property[]> {
    return await this.propertyRepo.find({
      where: { 
        company: { id: companyId }, 
        isActive: false 
      },
      withDeleted: true,
      relations: ['address'],
      order: { deletedAt: 'DESC' }
    });
  }

  /**
   * Busca un activo único validando la propiedad de la empresa.
   */
  async findOne(id: string, companyId: string): Promise<Property> {
    const property = await this.propertyRepo.findOne({
      where: { id, company: { id: companyId } },
      relations: ['address'],
    });

    if (!property) throw new NotFoundException('Recurso inmobiliario no localizado');
    return property;
  }

  // --- MÉTODOS DE ESCRITURA ---

  /**
   * Registra un nuevo inmueble y genera su entidad Address asociada en cascada.
   */
  async create(companyId: string, createDto: CreatePropertyDto): Promise<Property> {
    const { address, ...propertyData } = createDto;

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
   * Actualiza el activo inmobiliario.
   * Garantiza la persistencia de la dirección mediante fusión de entidad cargada.
   */
  async update(id: string, companyId: string, updateDto: UpdatePropertyDto): Promise<Property> {
    // 1. Cargamos la entidad con sus relaciones para mantener los IDs de relación
    const property = await this.findOne(id, companyId);
    const { address, ...data } = updateDto;

    // 2. Actualizamos datos básicos del Property
    Object.assign(property, data);

    // 3. Gestión de la relación Address (Evita pérdida de referencia)
    if (address) {
      if (property.address) {
        // Fusionamos sobre la entidad cargada para que TypeORM ejecute un UPDATE y no un INSERT
        Object.assign(property.address, address);
      } else {
        // Fallback en caso de que el inmueble no tuviera dirección previa
        property.address = address as any;
      }
    }

    try {
      return await this.propertyRepo.save(property);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Desactiva el inmueble (Borrado lógico). 
   * Restringido a perfiles OWNER.
   */
  async remove(id: string, companyId: string, companyRole: CompanyRole): Promise<Property> {
    const property = await this.findOne(id, companyId);

    if (companyRole !== CompanyRole.OWNER) {
      throw new ForbiddenException('Privilegios insuficientes: Se requiere rol OWNER');
    }

    property.isActive = false;
    property.deletedAt = new Date();

    return await this.propertyRepo.save(property);
  }

  /**
   * Restaura un activo de la papelera al estado operativo.
   */
  async restore(id: string, companyId: string, companyRole: CompanyRole): Promise<Property> {
    const property = await this.propertyRepo.findOne({
      where: { 
        id, 
        company: { id: companyId }, 
        isActive: false 
      },
      withDeleted: true,
      relations: ['address']
    });

    if (!property) throw new NotFoundException('El activo no se encuentra en el repositorio de eliminados');
    
    if (companyRole !== CompanyRole.OWNER) {
      throw new ForbiddenException('Operación restringida a administradores de la propiedad');
    }

    property.isActive = true;
    property.deletedAt = null;

    return await this.propertyRepo.save(property);
  }

  // --- TRATAMIENTO DE EXCEPCIONES ---

  /**
   * Traduce errores de motor de base de datos a excepciones HTTP semánticas.
   */
  private handleDBExceptions(error: any): never {
    if (error.code === '23505') {
      const detail = error.detail?.toLowerCase();
      if (detail?.includes('internal_code')) throw new ConflictException('Código interno ya registrado');
      if (detail?.includes('cadastral_reference')) throw new ConflictException('Referencia catastral ya registrada');
    }
    
    console.error('Core Persistence Error:', error);
    throw new InternalServerErrorException('Error en el procesamiento del activo inmobiliario');
  }
}