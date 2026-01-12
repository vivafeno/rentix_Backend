import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { AddressStatus } from 'src/address/enums/addressStatus.enum';
import { AddressType } from 'src/address/enums/addressType.enum';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
  ) {}

  /**
   * Crear Propiedad vinculada a la Empresa (Tenant)
   */
  async create(companyId: string, createDto: CreatePropertyDto) {
    const { address, ...propertyData } = createDto;

    // 1. Preparar la entidad con sus relaciones
    const property = this.propertyRepo.create({
      ...propertyData,
      companyId, // Vincular obligatoriamente al Tenant
      address: {
        ...address,
        companyId, // La dirección también pertenece al Tenant
        status: AddressStatus.ACTIVE,
        isDefault: true, 
        type: AddressType.PROPERTY, // Forzamos el tipo correcto
      },
    });

    try {
      // 2. Guardar (Cascade guardará la dirección también)
      return await this.propertyRepo.save(property);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Listar todas las propiedades de UNA empresa
   */
  async findAll(companyId: string) {
    return this.propertyRepo.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
      // 'address' se carga sola por eager: true en la entidad
    });
  }

  /**
   * Buscar una propiedad específica (Validando que pertenezca a la empresa)
   */
  async findOne(id: string, companyId: string) {
    const property = await this.propertyRepo.findOne({
      where: { id, companyId },
    });

    if (!property) {
      throw new NotFoundException(`Propiedad con ID ${id} no encontrada o no tienes acceso.`);
    }
    return property;
  }

  /**
   * Actualizar Propiedad
   */
  async update(id: string, companyId: string, updateDto: UpdatePropertyDto) {
    // 1. Verificar existencia y propiedad
    const property = await this.findOne(id, companyId);
    
    const { address, ...data } = updateDto;

    // 2. Actualizar datos planos de la propiedad
    Object.assign(property, data);

    // 3. Actualizar dirección si viene en el DTO
    // Al ser OneToOne con cascade, TypeORM intentará actualizarla si modificamos el objeto anidado
    if (address) {
      Object.assign(property.address, address);
    }

    try {
      return await this.propertyRepo.save(property);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Eliminar Propiedad (Cascade borrará la dirección)
   */
  async remove(id: string, companyId: string) {
    const property = await this.findOne(id, companyId);
    return this.propertyRepo.remove(property);
  }

  // --- HELPERS ---

  private handleDBExceptions(error: any) {
    if (error.code === '23505') { // Postgres Unique Violation
      // Detectamos si es por código interno o referencia catastral
      if (error.detail?.includes('internal_code')) {
        throw new ConflictException('Ya existe una propiedad con ese Código Interno en tu empresa.');
      }
      if (error.detail?.includes('cadastral_reference')) {
        throw new ConflictException('Esa Referencia Catastral ya está registrada en tu empresa.');
      }
    }
    // Log para el desarrollador
    console.error(error); 
    throw new InternalServerErrorException('Error inesperado al gestionar la propiedad.');
  }
}