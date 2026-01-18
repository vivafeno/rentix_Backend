import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressStatus } from './enums/addressStatus.enum';

/**
 * @class AddressDraftService
 * @description Gestión de direcciones en estado DRAFT (Hydrated Drafts).
 * Responsable del ciclo de vida temporal antes de la vinculación legal en el Wizard.
 * @version 2.3.1
 * @author Rentix
 */
@Injectable()
export class AddressDraftService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) {}

  /**
   * @method createDraft
   * @description Crea una dirección en borrador vinculada al usuario creador.
   */
  async createDraft(dto: CreateAddressDto, userId: string): Promise<Address> {
    const address = this.addressRepo.create({
      ...dto,
      status: AddressStatus.DRAFT,
      createdByUserId: userId,
    });
    return await this.addressRepo.save(address);
  }

  /**
   * @method findDraftById
   * @description Localiza un borrador asegurando que el usuario sea el propietario del mismo.
   */
  async findDraftById(addressId: string, userId: string): Promise<Address> {
    const address = await this.addressRepo.findOne({
      where: {
        id: addressId,
        status: AddressStatus.DRAFT,
        createdByUserId: userId,
      },
    });

    if (!address) {
      throw new NotFoundException(
        'Borrador de dirección no encontrado o acceso denegado.',
      );
    }

    return address;
  }

  /**
   * @method updateDraft
   * @description Actualiza los datos del borrador durante las fases intermedias del Wizard.
   */
  async updateDraft(
    addressId: string,
    dto: UpdateAddressDto,
    userId: string,
  ): Promise<Address> {
    const address = await this.findDraftById(addressId, userId);
    Object.assign(address, dto);
    return await this.addressRepo.save(address);
  }

  /**
   * @method attachToCompany
   * @description Transiciona la dirección de DRAFT a ACTIVE vinculándola a un patrimonio.
   * Resuelve error de linter 84 eliminando parámetros no utilizados.
   * @param {string} addressId UUID de la dirección.
   * @param {string} companyId ID de la empresa destino.
   * @param {string} userId ID del usuario que ejecuta la acción.
   * @returns {Promise<Address>} Dirección activada y vinculada.
   */
  async attachToCompany(
    addressId: string,
    companyId: string,
    userId: string,
  ): Promise<Address> {
    // 1. Validamos la propiedad del borrador
    const address = await this.findDraftById(addressId, userId);

    // 2. Hidratación y Cambio de Estado
    address.companyId = companyId;
    address.status = AddressStatus.ACTIVE;
    address.isDefault = true;

    return await this.addressRepo.save(address);
  }
}
