// src/config/seeder.service.ts

import { Injectable, Logger, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

/* ─────────────────────────────────────
 * AUTH / USERS
 * ───────────────────────────────────── */
import { User } from '../user/entities/user.entity';
import { AppRole } from '../auth/enums/user-global-role.enum';

/* ─────────────────────────────────────
 * COMPANY / ROLES
 * ───────────────────────────────────── */
import { Company } from '../company/entities/company.entity';
import { CompanyRoleEntity } from '../user-company-role/entities/userCompanyRole.entity';
import { CompanyRole } from '../user-company-role/enums/companyRole.enum';

/* ─────────────────────────────────────
 * FACTURAE (IDENTIDAD LEGAL)
 * ───────────────────────────────────── */
import { FiscalIdentity } from '../facturae/entities/fiscalIdentity.entity';
import { PersonType, TaxIdType, ResidenceType, TaxRegimeType } from '../facturae/enums/';
/* ─────────────────────────────────────
 * ADDRESS
 * ───────────────────────────────────── */
import { Address } from '../address/entities/address.entity';
import { AddressType } from '../address/enums/addressType.enum';

/* ─────────────────────────────────────
 * TAXES (CATÁLOGOS)
 * ───────────────────────────────────── */
import { VatRate } from '../common/catalogs/taxes/vat-rate/vat-rate.entity';
import { WithholdingRate } from '../common/catalogs/taxes/withholding-rate/withholding-rate.entity';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,

    @InjectRepository(FiscalIdentity)
    private readonly facturaePartyRepo: Repository<FiscalIdentity>,

    @InjectRepository(CompanyRoleEntity)
    private readonly userCompanyRoleRepo: Repository<CompanyRoleEntity>,

    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,

    @InjectRepository(VatRate)
    private readonly vatRepo: Repository<VatRate>,

    @InjectRepository(WithholdingRate)
    private readonly withholdingRepo: Repository<WithholdingRate>,
  ) { }

  /* ─────────────────────────────────────
   * SEED PRINCIPAL
   *
   * Reglas:
   * - Idempotente (se puede ejecutar N veces)
   * - Seguro (no crea datos huérfanos)
   * - Alineado con el dominio real
   * ───────────────────────────────────── */
  async seed(): Promise<void> {
    this.logger.log('▶ Inicio del seeding');

    // 1️⃣ Usuario superadmin (auditoría global)
    const superadmin = await this.seedSuperAdmin();

    // 2️⃣ Identidad legal demo (Facturae)
    const facturaeParty = await this.seedFacturaeParty();

    // 3️⃣ Empresa demo + dirección fiscal
    // ⚠️ createdBy = superadmin (auditoría, NO propiedad)
    const company = await this.seedCompanyWithFiscalAddress(
      facturaeParty,
      superadmin,
    );

    // 4️⃣ Relación usuario ↔ empresa (OWNER explícito)
    await this.seedUserCompanyRole(superadmin, company);

    // 5️⃣ Catálogos fiscales
    await this.seedVatRatesES();
    await this.seedWithholdingRatesES();

    this.logger.log('✔ Seeding completado correctamente');
  }

  /* ─────────────────────────────────────
   * USUARIO SUPERADMIN
   * ───────────────────────────────────── */
  private async seedSuperAdmin(): Promise<User> {
    let user = await this.userRepo.findOne({
      where: { email: 'admin@rentix.com' },
    });

    if (!user) {
      user = this.userRepo.create({
        email: 'admin@rentix.com',
        password: await bcrypt.hash('Admin123!', 10),       
        appRole: AppRole.SUPERADMIN,
        firstName: 'System',
        lastName: 'Admin',
        isEmailVerified: true,
      });

      await this.userRepo.save(user);
      this.logger.log('✔ Usuario superadmin creado (appRole: SUPERADMIN)');
    }

    return user;
  }

  /* ─────────────────────────────────────
   * FACTURAE PARTY DEMO
   *
   * Representa la identidad legal/fiscal.
   * NO contiene permisos ni auditoría de la app.
   * ───────────────────────────────────── */
  private async seedFacturaeParty(): Promise<FiscalIdentity> {
    let party = await this.facturaePartyRepo.findOne({
      where: { taxId: 'B00000000' },
    });

    if (!party) {
      party = this.facturaePartyRepo.create({
        // 1. Definimos que es EMPRESA
        personType: PersonType.LEGAL_ENTITY,

        // 2. Usamos corporateName en vez de legalName
        corporateName: 'Empresa Test S.L.',

        // 3. Ajustamos los enums a los nuevos valores AEAT
        taxId: 'B12345678',
        taxIdType: TaxIdType.NIF, // O el valor '01' si no usas el enum aquí
        residenceType: ResidenceType.RESIDENT, // 'R'
        countryCode: 'ESP',
      });

      await this.facturaePartyRepo.save(party);
      this.logger.log('✔ FacturaeParty demo creada');
    }

    return party;
  }

  /* ─────────────────────────────────────
   * EMPRESA + DIRECCIÓN FISCAL (DEMO)
   *
   * Reglas importantes:
   * - createdBy es OBLIGATORIO (auditoría)
   * - createdBy ≠ OWNER
   * - La dirección fiscal NUNCA se crea sin empresa
   * ───────────────────────────────────── */
  private async seedCompanyWithFiscalAddress(
    facturaeParty: FiscalIdentity,
    createdBy: User,
  ): Promise<Company> {
    let company = await this.companyRepo.findOne({
      where: { facturaeParty: { id: facturaeParty.id } },
      relations: ['fiscalAddress'],
    });

    if (!company) {
      // 1️⃣ Crear empresa con auditoría
      company = this.companyRepo.create({
        facturaeParty,
        createdByUserId: createdBy.id, // 🔥 NOT NULL
      });

      await this.companyRepo.save(company);

      // 2️⃣ Crear dirección fiscal
      const fiscalAddress = this.addressRepo.create({
        companyId: company.id,
        type: AddressType.FISCAL,
        addressLine1: 'Calle Demo 1',
        postalCode: '28001',
        city: 'Madrid',
        province: 'Madrid',
        countryCode: 'ES',
        isDefault: true,
      });

      await this.addressRepo.save(fiscalAddress);

      // 3️⃣ Enlazar dirección fiscal a la empresa
      company.fiscalAddress = fiscalAddress;
      await this.companyRepo.save(company);

      this.logger.log('✔ Empresa demo con dirección fiscal creada');
    }

    return company;
  }

  /* ─────────────────────────────────────
   * RELACIÓN USUARIO ↔ EMPRESA
   *
   * Aquí vive la propiedad real (OWNER).
   * ───────────────────────────────────── */
  private async seedUserCompanyRole(
    user: User,
    company: Company,
  ): Promise<void> {
    const exists = await this.userCompanyRoleRepo.findOne({
      where: {
        user: { id: user.id },
        company: { id: company.id },
      },
    });

    if (!exists) {
      await this.userCompanyRoleRepo.save(
        this.userCompanyRoleRepo.create({
          user,
          company,
          role: CompanyRole.OWNER,
        }),
      );

      this.logger.log('✔ Relación usuario-owner creada');
    }
  }

  /* ─────────────────────────────────────
   * IVA — ESPAÑA
   * ───────────────────────────────────── */
  private async seedVatRatesES(): Promise<void> {
    const countryCode = 'ES';

    const vatRates = [
      { tipo: 'IVA_GENERAL', descripcion: 'IVA general', porcentaje: 21, isDefault: true },
      { tipo: 'IVA_REDUCIDO', descripcion: 'IVA reducido', porcentaje: 10 },
      { tipo: 'IVA_SUPERREDUCIDO', descripcion: 'IVA superreducido', porcentaje: 4 },
      { tipo: 'IVA_EXENTO', descripcion: 'Sin IVA', porcentaje: 0 },
    ];

    for (const data of vatRates) {
      const exists = await this.vatRepo.findOne({
        where: { tipo: data.tipo, countryCode },
      });

      if (!exists) {
        await this.vatRepo.save(
          this.vatRepo.create({
            ...data,
            countryCode,
            isActive: true,
          }),
        );
      }
    }

    this.logger.log('✔ IVA ES seed completado');
  }

  /* ─────────────────────────────────────
   * RETENCIONES — ESPAÑA
   * ───────────────────────────────────── */
  private async seedWithholdingRatesES(): Promise<void> {
    const countryCode = 'ES';

    const rates = [
      { tipo: 'IRPF', descripcion: 'Retención IRPF general', porcentaje: 19, isDefault: true },
      { tipo: 'SIN_RETENCION', descripcion: 'Sin retención', porcentaje: 0 },
    ];

    for (const data of rates) {
      const exists = await this.withholdingRepo.findOne({
        where: { tipo: data.tipo, countryCode },
      });

      if (!exists) {
        await this.withholdingRepo.save(
          this.withholdingRepo.create({
            ...data,
            countryCode,
            isActive: true,
          }),
        );
      }
    }

    this.logger.log('✔ Retenciones ES seed completado');
  }
}
