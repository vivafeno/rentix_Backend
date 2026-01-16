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

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
  ) {}

  /**
   * Obtiene todos los inmuebles activos de una empresa.
   */
  async findAll(companyId: string): Promise<Property[]> {
    return await this.propertyRepo.find({
      where: { company: { id: companyId }, isActive: true },
      relations: ['address'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Obtiene inmuebles con estado inactivo (papelera), 
   * ignorando el filtro global de borrado lógico.
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
   * Recupera una entidad por su ID y contexto de empresa.
   */
  async findOne(id: string, companyId: string): Promise<Property> {
    const property = await this.propertyRepo.findOne({
      where: { id, company: { id: companyId } },
      relations: ['address'],
    });

    if (!property) throw new NotFoundException('Inmueble no encontrado');
    return property;
  }

  /**
   * Crea un inmueble y su dirección asociada bajo el contexto de empresa.
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
   * Actualiza los datos de un inmueble y su dirección.
   */
  async update(id: string, companyId: string, updateDto: UpdatePropertyDto): Promise<Property> {
    const property = await this.findOne(id, companyId);
    const { address, ...data } = updateDto;

    Object.assign(property, data);
    if (address && property.address) {
      Object.assign(property.address, address);
    }

    try {
      return await this.propertyRepo.save(property);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Realiza un borrado lógico actualizando isActive y el sello de tiempo.
   */
  async remove(id: string, companyId: string, companyRole: CompanyRole): Promise<Property> {
    const property = await this.findOne(id, companyId);

    if (companyRole !== CompanyRole.OWNER) {
      throw new ForbiddenException('Privilegios insuficientes para realizar esta operación');
    }

    property.isActive = false;
    property.deletedAt = new Date();

    return await this.propertyRepo.save(property);
  }

  /**
   * Restaura un inmueble inactivo al estado operativo.
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

    if (!property) throw new NotFoundException('Inmueble no encontrado en el repositorio de eliminados');
    
    if (companyRole !== CompanyRole.OWNER) {
      throw new ForbiddenException('Privilegios insuficientes para realizar esta operación');
    }

    property.isActive = true;
    property.deletedAt = null;

    return await this.propertyRepo.save(property);
  }

  /**
   * Gestión de excepciones de persistencia.
   */
  private handleDBExceptions(error: any): never {
    if (error.code === '23505') {
      const detail = error.detail?.toLowerCase();
      if (detail?.includes('internal_code')) throw new ConflictException('Código interno duplicado');
      if (detail?.includes('cadastral_reference')) throw new ConflictException('Referencia catastral duplicada');
    }
    
    console.error('Database Exception:', error);
    throw new InternalServerErrorException('Error en el procesamiento de la solicitud');
  }
}