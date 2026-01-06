import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressType } from './enums/addressType.enum';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) {}

  // ─────────────────────────────────────
  // Crear dirección para una empresa
  // ─────────────────────────────────────
  async createForCompany(
    companyId: string,
    dto: CreateAddressDto,
  ): Promise<Address> {

    /**
     * Regla de negocio:
     * Solo puede existir UNA dirección FISCAL activa por empresa
     */
    if (dto.type === AddressType.FISCAL) {
      const existingFiscal = await this.addressRepo.findOne({
        where: {
          companyId,
          type: AddressType.FISCAL,
          isActive: true,
        },
      });

      if (existingFiscal) {
        throw new ConflictException(
          'La empresa ya tiene una dirección fiscal activa',
        );
      }
    }

    /**
     * Creación directa.
     * El companyId viene del contexto (JWT / ruta), no del DTO.
     */
    const address = this.addressRepo.create({
      companyId,
      ...dto,
    });

    return this.addressRepo.save(address);
  }

  // ─────────────────────────────────────
  // Listar direcciones de una empresa
  // ─────────────────────────────────────
  async findAllForCompany(
    companyId: string,
    options?: { includeInactive?: boolean },
  ): Promise<Address[]> {

    return this.addressRepo.find({
      where: {
        companyId,
        /**
         * Por defecto solo devolvemos direcciones activas.
         * includeInactive permite usos administrativos.
         */
        ...(options?.includeInactive ? {} : { isActive: true }),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // ─────────────────────────────────────
  // Obtener una dirección concreta
  // ─────────────────────────────────────
  async findOneForCompany(
    companyId: string,
    addressId: string,
  ): Promise<Address | null> {

    return this.addressRepo.findOne({
      where: {
        id: addressId,
        companyId,
        isActive: true,
      },
    });
  }

  // ─────────────────────────────────────
  // Actualizar dirección
  // ─────────────────────────────────────
  async updateForCompany(
    companyId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ): Promise<Address | null> {

    /**
     * Permitimos actualizar direcciones inactivas a propósito.
     * Si en el futuro no se quiere, aquí se añade isActive: true.
     */
    const address = await this.addressRepo.findOne({
      where: {
        id: addressId,
        companyId,
      },
    });

    if (!address) return null;

    /**
     * Si se intenta cambiar a FISCAL,
     * validamos que no exista OTRA dirección fiscal activa
     */
    if (
      dto.type === AddressType.FISCAL &&
      address.type !== AddressType.FISCAL
    ) {
      const existingFiscal = await this.addressRepo.findOne({
        where: {
          companyId,
          type: AddressType.FISCAL,
          isActive: true,
          /**
           * Defensa: excluimos la propia dirección
           */
          id: Not(addressId),
        },
      });

      if (existingFiscal) {
        throw new ConflictException(
          'La empresa ya tiene una dirección fiscal activa',
        );
      }
    }

    /**
     * Aplicamos cambios parciales.
     * Las reglas complejas viven fuera de la entity.
     */
    Object.assign(address, dto);

    return this.addressRepo.save(address);
  }

  // ─────────────────────────────────────
  // Soft delete (desactivar dirección)
  // ─────────────────────────────────────
  async softDeleteForCompany(
    companyId: string,
    addressId: string,
  ): Promise<boolean> {

    const address = await this.addressRepo.findOne({
      where: {
        id: addressId,
        companyId,
        isActive: true,
      },
    });

    if (!address) return false;

    /**
     * Soft delete clásico:
     * no se elimina el registro, solo se desactiva
     */
    address.isActive = false;

    await this.addressRepo.save(address);
    return true;
  }
}
