import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressStatus } from './enums/addressStatus.enum';
import { AppRole } from 'src/auth/enums/user-global-role.enum';

/**
 * @class AddressDraftService
 * @description Gestión de direcciones en estado DRAFT (Hydrated Drafts).
 * Implementa lógica de bypass jerárquico para soporte administrativo.
 * @version 2.3.3
 * @author Rentix 2026
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
   * @description Localiza un borrador. Aplica bypass de propiedad si el rol es SUPERADMIN.
   * @public Necesario para acceso desde AddressDraftController.
   */
  async findDraftById(
    addressId: string,
    userId: string,
    appRole: AppRole, // 🛡️ Usado para validación jerárquica
  ): Promise<Address> {
    const whereCondition = {
      id: addressId,
      status: AddressStatus.DRAFT,
      ...(appRole !== AppRole.SUPERADMIN ? { createdByUserId: userId } : {}),
    };

    const address = await this.addressRepo.findOne({ where: whereCondition });

    if (!address) {
      throw new NotFoundException(
        'Borrador de dirección no encontrado o acceso denegado.',
      );
    }

    return address;
  }

  /**
   * @method updateDraft
   * @description Actualiza los datos del borrador asegurando integridad de acceso.
   */
  async updateDraft(
    addressId: string,
    dto: UpdateAddressDto,
    userId: string,
    appRole: AppRole,
  ): Promise<Address> {
    const address = await this.findDraftById(addressId, userId, appRole);
    Object.assign(address, dto);
    return await this.addressRepo.save(address);
  }

  /**
   * @method attachToCompany
   * @description Transiciona la dirección de DRAFT a ACTIVE vinculándola a un patrimonio.
   * RESOLUCIÓN ESLint & TS: appRole se utiliza en la cadena de validación.
   */
  async attachToCompany(
    addressId: string,
    companyId: string,
    userId: string,
    appRole: AppRole, // 🛡️ Sincronizado con Controller
  ): Promise<Address> {
    // 1. Validamos la propiedad o permisos sobre el borrador
    const address = await this.findDraftById(addressId, userId, appRole);

    // 2. Hidratación y Cambio de Estado
    address.companyId = companyId;
    address.status = AddressStatus.ACTIVE;
    address.isDefault = true;

    return await this.addressRepo.save(address);
  }
}
