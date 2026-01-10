import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressStatus } from './enums/addressStatus.enum';

/**
 * AddressDraftService
 *
 * Responsabilidad ÚNICA:
 * - Gestionar direcciones en estado DRAFT
 * - Direcciones NO asociadas todavía a una empresa
 *
 * ⚠️ Este servicio NO aplica reglas de negocio de empresa
 * (eso vive en AddressService)
 */
@Injectable()
export class AddressDraftService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) { }

  // ─────────────────────────────────────
  // Crear dirección en borrador
  // ─────────────────────────────────────
  async createDraft(dto: CreateAddressDto): Promise<Address> {
    
    const address = this.addressRepo.create(dto);
    return this.addressRepo.save(address);
  }

  // ─────────────────────────────────────
  // Obtener una dirección draft concreta
  // ─────────────────────────────────────
  async findDraftById(addressId: string): Promise<Address> {
    const address = await this.addressRepo.findOne({
      where: {
        id: addressId,
        status: AddressStatus.DRAFT,
        isActive: true,
      },
    });

    if (!address) {
      throw new NotFoundException('Dirección en borrador no encontrada');
    }

    return address;
  }

  // ─────────────────────────────────────
  // Actualizar dirección draft
  // ─────────────────────────────────────
  async updateDraft(
    addressId: string,
    dto: UpdateAddressDto,
  ): Promise<Address> {
    const address = await this.findDraftById(addressId);

    Object.assign(address, dto);

    return this.addressRepo.save(address);
  }

  // ─────────────────────────────────────
  // Asociar draft a una empresa
  // ─────────────────────────────────────
  async attachToCompany(
    addressId: string,
    companyId: string,
  ): Promise<Address> {
    const address = await this.findDraftById(addressId);

    address.companyId = companyId;
    address.status = AddressStatus.ACTIVE;

    return this.addressRepo.save(address);
  }
}
