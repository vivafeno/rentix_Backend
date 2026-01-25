import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressStatus } from './enums/address-status.enum';
import { AppRole } from 'src/auth/enums/user-global-role.enum';

@Injectable()
export class AddressDraftService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) {}

  async createDraft(dto: CreateAddressDto, userId: string): Promise<Address> {
    const address = new Address();
    Object.assign(address, dto);
    
    address.status = AddressStatus.DRAFT;
    address.createdByUserId = userId;
    address.isMain = false;

    return await this.addressRepo.save(address);
  }

  async findDraftById(addressId: string, userId: string, appRole: AppRole): Promise<Address> {
    const whereCondition: any = {
      id: addressId,
      status: AddressStatus.DRAFT,
    };

    if (appRole !== AppRole.SUPERADMIN) {
      whereCondition.createdByUserId = userId;
    }

    const address = await this.addressRepo.findOne({ where: whereCondition });
    if (!address) throw new NotFoundException('Borrador no localizado.');
    return address;
  }

  async updateDraft(addressId: string, dto: UpdateAddressDto, userId: string, appRole: AppRole): Promise<Address> {
    const address = await this.findDraftById(addressId, userId, appRole);
    Object.assign(address, dto);
    return await this.addressRepo.save(address);
  }

  async attachToCompany(addressId: string, companyId: string, userId: string, appRole: AppRole): Promise<Address> {
    const address = await this.findDraftById(addressId, userId, appRole);
    address.companyId = companyId;
    address.status = AddressStatus.ACTIVE;
    address.isDefault = true;
    return await this.addressRepo.save(address);
  }
}