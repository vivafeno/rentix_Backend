import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto';

import { FacturaeParty } from 'src/facturae/entities/facturaeParty.entity';
import { Address } from 'src/address/entities/address.entity';
import { AddressStatus } from 'src/address/enums/addressStatus.enum';

import { CompanyRole } from 'src/user-company-role/enums/userCompanyRole.enum';
import { UserCompanyRole } from 'src/user-company-role/entities/userCompanyRole.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,

    @InjectRepository(FacturaeParty)
    private readonly facturaePartyRepo: Repository<FacturaeParty>,

    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,

    @InjectRepository(UserCompanyRole)
    private readonly userCompanyRoleRepo: Repository<UserCompanyRole>,

    private readonly dataSource: DataSource,
  ) {}

  /**
   * ─────────────────────────────────────────────
   * Crear empresa (flujo desacoplado)
   *
   * PRECONDICIONES:
   * - facturaePartyId existe
   * - fiscalAddressId existe
   * - fiscalAddress está en DRAFT o ACTIVE
   * - el usuario autenticado será OWNER
   * ─────────────────────────────────────────────
   */
  async createCompany(
    dto: CreateCompanyDto,
    ownerUserId: string,
  ): Promise<Company> {
    return this.dataSource.transaction(async (manager) => {
      // 1️⃣ Validar identidad fiscal
      const facturaeParty = await manager.findOne(FacturaeParty, {
        where: {
          id: dto.facturaePartyId,
          isActive: true,
        },
      });

      if (!facturaeParty) {
        throw new NotFoundException(
          'Identidad fiscal no encontrada',
        );
      }

      // 2️⃣ Validar dirección fiscal
      const fiscalAddress = await manager.findOne(Address, {
        where: {
          id: dto.fiscalAddressId,
          isActive: true,
        },
      });

      if (!fiscalAddress) {
        throw new NotFoundException(
          'Dirección fiscal no encontrada',
        );
      }

      // 3️⃣ Defensa: la dirección NO puede estar ya ligada a otra empresa
      if (fiscalAddress.companyId) {
        throw new ConflictException(
          'La dirección fiscal ya está asociada a una empresa',
        );
      }

      // 4️⃣ Crear empresa
      const company = manager.create(Company, {
        facturaeParty,
        fiscalAddress,
      });

      await manager.save(company);

      // 5️⃣ Activar dirección y asociarla
      fiscalAddress.companyId = company.id;
      fiscalAddress.status = AddressStatus.ACTIVE;

      await manager.save(fiscalAddress);

      // 6️⃣ Asignar OWNER
      const ownerRole = manager.create(UserCompanyRole, {
        user: { id: ownerUserId },
        company,
        role: CompanyRole.OWNER,
      });

      await manager.save(ownerRole);

      return company;
    });
  }

  /**
   * ─────────────────────────────────────────────
   * Empresas del usuario autenticado
   * ─────────────────────────────────────────────
   */
  async getCompaniesForUser(userId: string) {
    const relations = await this.userCompanyRoleRepo.find({
      where: {
        user: { id: userId },
        isActive: true,
      },
      relations: ['company', 'company.facturaeParty'],
    });

    return relations.map((r) => ({
      companyId: r.company.id,
      legalName: r.company.facturaeParty.legalName,
      tradeName: r.company.facturaeParty.tradeName,
      role: r.role,
    }));
  }

  /**
   * ─────────────────────────────────────────────
   * Empresa concreta
   * ─────────────────────────────────────────────
   */
  findOne(id: string) {
    return this.companyRepo.findOne({
      where: { id, isActive: true },
      relations: ['facturaeParty', 'fiscalAddress'],
    });
  }

  /**
   * ─────────────────────────────────────────────
   * Listado global
   * ─────────────────────────────────────────────
   */
  findAll() {
    return this.companyRepo.find({
      where: { isActive: true },
      relations: ['facturaeParty', 'fiscalAddress'],
      order: { createdAt: 'DESC' },
    });
  }
}
