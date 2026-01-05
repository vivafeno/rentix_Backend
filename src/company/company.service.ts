import { ConflictException, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CreateCompanyLegalDto } from './dto/create-company-legal.dto';

import { Company } from './entities/company.entity';
import { FacturaeParty } from 'src/facturae/entities/facturae-party.entity';
import { Address } from 'src/address/entities/address.entity';
import { AddressType } from 'src/address/enums/addres-type.enum';
import { CompanyRole } from 'src/user-company-role/enums/company-role.enum';
import { UserCompanyRole } from 'src/user-company-role/entities/user-company-role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { create } from 'domain';
import { async } from 'rxjs';

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
  ) { }

  /**
     * 🔹 Flujo LEGAL de creación de empresa
     * - Crea identidad fiscal (FacturaeParty)
     * - Crea dirección fiscal
     * - Crea empresa
     * - Asigna rol OWNER al usuario creador
     */

  /**
    * Crea una empresa completa a nivel legal
    */
  async createLegalCompany(dto: CreateCompanyLegalDto, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      // 1️⃣ Comprobar que no exista ese NIF/CIF
      const existingParty = await manager.findOne(FacturaeParty, {
        where: { taxId: dto.taxId },
      });

      if (existingParty) {
        throw new ConflictException('Ya existe una empresa con ese NIF/CIF');
      }

      // 2️⃣ Crear identidad legal (FacturaeParty)
      const facturaeParty = manager.create(FacturaeParty, {
        personType: dto.personType,
        taxIdType: dto.taxIdType,
        taxId: dto.taxId,
        legalName: dto.legalName,
        tradeName: dto.tradeName,
        taxRegime: dto.taxRegime,
        subjectType: dto.subjectType,
      });

      await manager.save(facturaeParty);

      // 3️⃣ Crear empresa
      const company = manager.create(Company, {
        facturaeParty,
        facturaePartyId: facturaeParty.id,
      });

      await manager.save(company);

      // 4️⃣ Asignar OWNER al creador
      const role = manager.create(UserCompanyRole, {
        user: { id: userId },
        company: { id: company.id },
        role: CompanyRole.OWNER,
      });

      await manager.save(role);

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
    relations: [
      'facturaeParty',
      'fiscalAddress',
    ],
    order: {
      createdAt: 'DESC',
    },
  });
}
}
