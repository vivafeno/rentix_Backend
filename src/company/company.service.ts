import { ConflictException, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateCompanyLegalDto } from './dto/createCompanyLegal.dto';
import { Company } from './entities/company.entity';
import { FacturaeParty } from 'src/facturae/entities/facturaeParty.entity';
import { Address } from 'src/address/entities/address.entity';
import { AddressType } from 'src/address/enums/addressType.enum';
import { CompanyRole } from 'src/user-company-role/enums/company-role.enum';
import { UserCompanyRole } from 'src/user-company-role/entities/user-company-role.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,

    @InjectRepository(FacturaeParty)
    private readonly facturaePartyRepo: Repository<FacturaeParty>,

    @InjectRepository(UserCompanyRole)
    private readonly userCompanyRoleRepo: Repository<UserCompanyRole>,

    private readonly dataSource: DataSource,
  ) {}

  /**
   * 🔹 Flujo LEGAL de creación de empresa
   * - Valida unicidad por NIF/CIF
   * - Crea FacturaeParty
   * - Crea dirección fiscal
   * - Crea Company
   * - Asigna OWNER
   */
  async createLegalCompany(dto: CreateCompanyLegalDto) {
    return this.dataSource.transaction(async (manager) => {

      // 1️⃣ Comprobar unicidad REAL (facturae_parties)
      const existingParty = await manager.findOne(FacturaeParty, {
        where: {
          taxId: dto.facturaeParty.taxId,
        },
      });

      if (existingParty) {
        throw new ConflictException(
          'Ya existe una empresa con ese NIF/CIF',
        );
      }

      // 2️⃣ Crear identidad fiscal
      const facturaeParty = manager.create(FacturaeParty, {
        ...dto.facturaeParty,
      });
      await manager.save(facturaeParty);

      // 3️⃣ Crear dirección fiscal
      const fiscalAddress = manager.create(Address, {
        ...dto.fiscalAddress,
        type: AddressType.FISCAL,
      });
      await manager.save(fiscalAddress);

      // 4️⃣ Crear empresa
      const company = manager.create(Company, {
        facturaeParty,
        fiscalAddress,
        email: dto.email,
        phone: dto.phone,
      });
      await manager.save(company);

      // 5️⃣ Asignar OWNER
      const ownerRole = manager.create(UserCompanyRole, {
        user: { id: dto.ownerUserId },
        company,
        role: CompanyRole.OWNER,
      });
      await manager.save(ownerRole);

      return {
        id: company.id,
        legalName: facturaeParty.legalName,
        taxId: facturaeParty.taxId,
      };
    });
  }

  async getCompaniesForUser(userId: string) {
    const relations = await this.userCompanyRoleRepo.find({
      where: {
        user: { id: userId },
        isActive: true,
      },
      relations: ['company', 'company.facturaeParty'],
    });

    return relations.map(r => ({
      companyId: r.company.id,
      legalName: r.company.facturaeParty.legalName,
      tradeName: r.company.facturaeParty.tradeName,
      role: r.role,
    }));
  }

  findOne(id: string) {
    return this.companyRepo.findOne({
      where: { id, isActive: true },
      relations: ['facturaeParty', 'fiscalAddress'],
    });
  }

  async findAll() {
    return this.companyRepo.find({
      where: { isActive: true },
      relations: ['facturaeParty', 'fiscalAddress'],
      order: { createdAt: 'DESC' },
    });
  }
}
