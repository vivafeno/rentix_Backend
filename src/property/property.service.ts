import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
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

  async create(companyId: string, createDto: CreatePropertyDto): Promise<Property> {
    const { address, ...propertyData } = createDto;

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
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(companyId: string): Promise<Property[]> {
    return this.propertyRepo.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, companyId: string): Promise<Property> {
    const property = await this.propertyRepo.findOne({
      where: { id, companyId },
    });

    if (!property) {
      throw new NotFoundException(`Propiedad con ID ${id} no encontrada.`);
    }
    return property;
  }

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

  async remove(id: string, companyId: string): Promise<Property> {
    const property = await this.findOne(id, companyId);
    // Soft Delete: Marca deletedAt en lugar de borrar físicamente
    return this.propertyRepo.softRemove(property);
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') {
      if (error.detail?.includes('internal_code')) {
        throw new ConflictException('Código interno duplicado.');
      }
      if (error.detail?.includes('cadastral_reference')) {
        throw new ConflictException('Referencia catastral duplicada.');
      }
    }
    throw new InternalServerErrorException('Error en la gestión del inmueble.');
  }
}