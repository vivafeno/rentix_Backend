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
import { CompanyRoleEntity } from 'src/user-company-role/entities/userCompanyRole.entity';
import { CompanyRole } from 'src/user-company-role/enums/companyRole.enum';

/**
 * @description Servicio de gestión de direcciones postales y fiscales.
 * Implementa el patrón Hydrated Drafts y aislamiento por contexto patrimonial.
 * @author Rentix 2026
 * @version 2.3.0
 */
@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,

    @InjectRepository(CompanyRoleEntity)
    private readonly userCompanyRoleRepo: Repository<CompanyRoleEntity>,
  ) {}

  /* ------------------------------------------------------------------
   * LÓGICA DRAFT (WIZARD - HYDRATED DRAFTS)
   * ------------------------------------------------------------------ */

  /**
   * @description Crea un borrador de dirección para persistencia temporal en Wizards.
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
   * @description Recupera un borrador validando la propiedad del creador.
   */
  async findDraft(id: string, userId: string): Promise<Address> {
    const address = await this.addressRepo.findOne({
      where: { id, status: AddressStatus.DRAFT, createdByUserId: userId },
    });
    if (!address)
      throw new NotFoundException('Borrador no encontrado o acceso denegado');
    return address;
  }

  /**
   * @description Actualiza el borrador durante los pasos del Wizard.
   */
  async updateDraft(
    id: string,
    dto: UpdateAddressDto,
    userId: string,
  ): Promise<Address> {
    const address = await this.findDraft(id, userId);
    Object.assign(address, dto);
    return this.addressRepo.save(address);
  }

  /* ------------------------------------------------------------------
   * LÓGICA DE GESTIÓN PATRIMONIAL (TENANT ISOLATION)
   * ------------------------------------------------------------------ */

  /**
   * @description Lista direcciones vinculadas a una empresa con seguridad por rol.
   */
  async findAllForCompany(
    companyId: string,
    userId: string,
    appRole: AppRole,
    options: { includeInactive: boolean },
  ): Promise<Address[]> {
    await this.validateCompanyAccess(companyId, userId, appRole);

    return this.addressRepo.find({
      where: {
        companyId,
        ...(options.includeInactive ? {} : { status: AddressStatus.ACTIVE }),
      },
      order: { isDefault: 'DESC', createdAt: 'ASC' },
    });
  }

  /**
   * @description Baja lógica de dirección. Veri*factu prohíbe el borrado físico si hay trazabilidad.
   */
  async softDeleteForCompany(
    companyId: string,
    addressId: string,
    userId: string,
    appRole: AppRole,
  ): Promise<boolean> {
    await this.validateCompanyAccess(companyId, userId, appRole, true);

    const address = await this.addressRepo.findOne({
      where: { id: addressId, companyId },
    });
    if (!address)
      throw new NotFoundException('Dirección no encontrada en este patrimonio');

    address.status = AddressStatus.ARCHIVED; // 🚩 Cambio de estado según Enum
    await this.addressRepo.save(address);
    return true;
  }

  /* ------------------------------------------------------------------
   * HELPERS DE SEGURIDAD (CONTEXT OVERRIDING)
   * ------------------------------------------------------------------ */

  /**
   * @description Valida si el usuario tiene permiso sobre la empresa solicitada.
   * @throws {ForbiddenException} Si no hay vínculo o el rol es insuficiente.
   */
  private async validateCompanyAccess(
    companyId: string,
    userId: string,
    appRole: AppRole,
    requiresAdmin = false,
  ): Promise<void> {
    // 🛡️ Bypass para el Administrador de la Plataforma
    if (appRole === AppRole.SUPERADMIN) return;

    const userRole = await this.userCompanyRoleRepo.findOne({
      where: {
        userId: userId, // 🚩 Simplificado: usa userId directamente si la entidad lo permite
        companyId: companyId,
        isActive: true,
      },
    });

    if (!userRole)
      throw new ForbiddenException(
        'No tienes acceso a este contexto patrimonial',
      );

    if (requiresAdmin && userRole.role !== CompanyRole.OWNER) {
      throw new ForbiddenException(
        'Acción restringida al Propietario del patrimonio',
      );
    }
  }
}
