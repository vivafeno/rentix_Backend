import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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
 * Responsable del ciclo de vida temporal antes de la vinculación legal.
 * @author Rentix 2026
 * @version 2.3.0
 */
@Injectable()
export class AddressDraftService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) { }

  /**
   * @description Crea una dirección en borrador vinculada al usuario.
   * El estado inicial es siempre DRAFT para cumplir con el flujo del Wizard.
   */
  async createDraft(dto: CreateAddressDto, userId: string): Promise<Address> {
    const address = this.addressRepo.create({
      ...dto,
      status: AddressStatus.DRAFT,
      createdByUserId: userId,
    });
    return this.addressRepo.save(address);
  }

  /**
   * @description Recupera un borrador específico.
   * Implementa validación de propiedad para evitar escalada de privilegios.
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
      throw new NotFoundException('Borrador de dirección no encontrado o acceso denegado.');
    }

    return address;
  }

  /**
   * @description Actualiza los datos del borrador durante el Wizard.
   */
  async updateDraft(
    addressId: string,
    dto: UpdateAddressDto,
    userId: string,
  ): Promise<Address> {
    const address = await this.findDraftById(addressId, userId);

    // Mapeo directo gracias a la normalización de nombres en el DTO
    Object.assign(address, dto);

    return this.addressRepo.save(address);
  }

  /**
   * @description Transiciona la dirección de DRAFT a ACTIVE vinculándola a un patrimonio.
   * Blueprint 2026: Verificación de contexto antes de la hidratación final.
   */
  async attachToCompany(
    addressId: string,
    companyId: string,
    userId: string,
    appRole: AppRole,
  ): Promise<Address> {
    // 1. Validamos que el borrador pertenezca al usuario (o sea SUPERADMIN)
    const address = await this.findDraftById(addressId, userId);

    // 2. Hidratación y Cambio de Estado
    address.companyId = companyId;
    address.status = AddressStatus.ACTIVE;
    address.isDefault = true; // Por defecto, la dirección vinculada en el wizard es la principal

    return this.addressRepo.save(address);
  }
}