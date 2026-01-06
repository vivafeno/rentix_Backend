import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Property } from './entities/property.entity';
import { CreatePropertyDto, UpdatePropertyDto } from './dto';
import { Address } from 'src/address/entities/address.entity';
import { AddressType } from 'src/address/enums/addressType.enum';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) {}

  async createForCompany(companyId: string, dto: CreatePropertyDto): Promise<Property> {
    const address = await this.addressRepo.findOne({
      where: {
        id: dto.addressId,
        companyId,
        type: AddressType.PROPERTY,
        isActive: true,
      },
    });

    if (!address) {
      throw new BadRequestException('La dirección no es válida o no es de tipo PROPERTY');
    }

    const property = this.propertyRepo.create({
      companyId,
      ...dto,
    });

    return this.propertyRepo.save(property);
  }

  async findAllForCompany(companyId: string): Promise<Property[]> {
    return this.propertyRepo.find({
      where: { companyId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneForCompany(companyId: string, propertyId: string): Promise<Property | null> {
    return this.propertyRepo.findOne({
      where: { id: propertyId, companyId, isActive: true },
    });
  }

  async updateForCompany(
    companyId: string,
    propertyId: string,
    dto: UpdatePropertyDto,
  ): Promise<Property | null> {

    const property = await this.propertyRepo.findOne({
      where: { id: propertyId, companyId },
    });

    if (!property) return null;

    Object.assign(property, dto);
    return this.propertyRepo.save(property);
  }

  async softDeleteForCompany(companyId: string, propertyId: string): Promise<boolean> {
    const property = await this.propertyRepo.findOne({
      where: { id: propertyId, companyId, isActive: true },
    });

    if (!property) return false;

    property.isActive = false;
    await this.propertyRepo.save(property);
    return true;
  }
}
