import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Address } from './entities/address.entity';
import { AddressStatus } from './enums/address-status.enum';
import { AppRole } from 'src/auth/enums/user-global-role.enum';
import { CompanyRoleEntity } from 'src/user-company-role/entities/user-company-role.entity';
import { CompanyRole } from 'src/user-company-role/enums/user-company-role.enum';

/**
 * @class AddressService
 * @description Gestión operativa de direcciones consolidadas.
 * Implementa aislamiento multi-tenant y trazabilidad según Veri*factu.
 * @version 2026.2.1
 * @author Rentix 2026
 */
@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,

    @InjectRepository(CompanyRoleEntity)
    private readonly userCompanyRoleRepo: Repository<CompanyRoleEntity>,
  ) {}

  /**
   * @method findAllForCompany
   * @description Recupera el inventario de direcciones de una empresa con validación de rol.
   */
  async findAllForCompany(
    companyId: string,
    userId: string,
    appRole: AppRole,
    options: { includeInactive: boolean },
  ): Promise<Address[]> {
    await this.validateCompanyAccess(companyId, userId, appRole);

    return await this.addressRepo.find({
      where: {
        companyId,
        ...(options.includeInactive ? {} : { status: AddressStatus.ACTIVE }),
      },
      order: { isDefault: 'DESC', createdAt: 'ASC' },
    });
  }

  /**
   * @method softDeleteForCompany
   * @description Baja lógica de dirección para mantener integridad fiscal.
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

    if (!address) {
      throw new NotFoundException(
        'Dirección no encontrada en este patrimonio.',
      );
    }

    address.status = AddressStatus.ARCHIVED;
    await this.addressRepo.save(address);
    return true;
  }

  /* ------------------------------------------------------------------
   * HELPERS DE SEGURIDAD (BLINDAJE TOTAL RENTIX)
   * ------------------------------------------------------------------ */

  /**
   * @method validateCompanyAccess
   * @description Verifica el vínculo jerárquico entre usuario y empresa.
   * @private
   */
  private async validateCompanyAccess(
    companyId: string,
    userId: string,
    appRole: AppRole,
    requiresAdmin = false,
  ): Promise<void> {
    // 🛡️ Bypass para SUPERADMIN (Control Total)
    if (appRole === AppRole.SUPERADMIN) return;

    const userRole = await this.userCompanyRoleRepo.findOne({
      where: {
        userId,
        companyId,
        isActive: true,
      },
    });

    if (!userRole) {
      throw new ForbiddenException(
        'No tienes acceso a este contexto patrimonial.',
      );
    }

    if (requiresAdmin && userRole.role !== CompanyRole.OWNER) {
      throw new ForbiddenException(
        'Acción restringida al Propietario del patrimonio.',
      );
    }
  }
}
