import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    const address = this.addressRepository.create(createAddressDto);
    return await this.addressRepository.save(address);
  }

  async findAll(options?: { includeInactive?: boolean }): Promise<Address[]> {
    const where = options?.includeInactive ? {} : { isActive: true };
    return await this.addressRepository.find({ where });
  }

  async findOne(id: string): Promise<Address | null> {
    return await this.addressRepository.findOne({ where: { id } });
  }

  async update(id: string, updateAddressDto: UpdateAddressDto): Promise<Address | null> {
    const address = await this.addressRepository.findOne({ where: { id } });
    if (!address) return null;
    Object.assign(address, updateAddressDto);
    return await this.addressRepository.save(address);
  }

  async softDelete(id: string): Promise<boolean> {
    const address = await this.addressRepository.findOne({ where: { id, isActive: true } });
    if (!address) return false;
    address.isActive = false;
    await this.addressRepository.save(address);
    return true;
  }
}
