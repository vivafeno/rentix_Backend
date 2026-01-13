import { Injectable, Logger } from '@nestjs/common';
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
import { PersonType, TaxIdType, ResidenceType } from '../facturae/enums/';

/* ─────────────────────────────────────
 * ADDRESS
 * ───────────────────────────────────── */
import { Address } from '../address/entities/address.entity';
import { AddressType } from '../address/enums/addressType.enum';

/* ─────────────────────────────────────
 * TAXES (CATÁLOGOS & ENTIDAD)
 * ───────────────────────────────────── */
import { VatRate } from '../common/catalogs/taxes/vat-rate/vat-rate.entity';
import { WithholdingRate } from '../common/catalogs/taxes/withholding-rate/withholding-rate.entity';
import { Tax } from '../tax/entities/tax.entity'; // 👈 Entidad usada en Contracts
import { TaxType } from '../tax/enums/tax-type.enum';

/* ─────────────────────────────────────
 * NUEVOS MÓDULOS (Property, Client, Contract)
 * ───────────────────────────────────── */
import { Property } from '../property/entities/property.entity';
import { PropertyType } from '../property/enums/property-type.enum';
import { PropertyStatus } from '../property/enums/property-status.enum';

import { Client } from '../client/entities/client.entity'; // O ClientProfile según como lo llamaras
import { ClientStatus } from '../client/enums/client-status.enum';

import { Contract } from '../contract/entities/contract.entity';
import { ContractType, ContractStatus, BillingPeriod, PaymentMethod } from '../contract/enums';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Company) private readonly companyRepo: Repository<Company>,
    @InjectRepository(FiscalIdentity) private readonly fiscalIdentityRepo: Repository<FiscalIdentity>,
    @InjectRepository(CompanyRoleEntity) private readonly userCompanyRoleRepo: Repository<CompanyRoleEntity>,
    @InjectRepository(Address) private readonly addressRepo: Repository<Address>,

    // Catálogos antiguos (si los sigues usando para validaciones extra)
    @InjectRepository(VatRate) private readonly vatRepo: Repository<VatRate>,
    @InjectRepository(WithholdingRate) private readonly withholdingRepo: Repository<WithholdingRate>,

    // 👇 NUEVOS REPOSITORIOS
    @InjectRepository(Tax) private readonly taxRepo: Repository<Tax>,
    @InjectRepository(Property) private readonly propertyRepo: Repository<Property>,
    @InjectRepository(Client) private readonly clientRepo: Repository<Client>,
    @InjectRepository(Contract) private readonly contractRepo: Repository<Contract>,
  ) { }

  async seed(): Promise<void> {
    this.logger.log('▶ Inicio del seeding...');

    // 1️⃣ Usuario Superadmin
    const superadmin = await this.seedSuperAdmin();

    // 2️⃣ Identidad Legal Empresa (Facturae)
    const companyFiscalId = await this.seedFiscalIdentity('B12345678', 'Inmobiliaria Demo S.L.', PersonType.LEGAL_ENTITY);

    // 3️⃣ Empresa Demo + Dirección Fiscal
    const company = await this.seedCompanyWithFiscalAddress(companyFiscalId, superadmin);

    // 4️⃣ Relación Owner
    await this.seedUserCompanyRole(superadmin, company);

    // 5️⃣ Catálogos Fiscales (Base de conocimiento)
    await this.seedVatRatesES();
    await this.seedWithholdingRatesES();

    // 6️⃣ Impuestos Operativos (Entidades Tax para usar en Contratos)
    const { taxIva, taxIrpf } = await this.seedOperationalTaxes(company);

    // 7️⃣ Propiedad (El Activo)
    const property = await this.seedProperty(company);

    // 8️⃣ Cliente (El Inquilino)
    const client = await this.seedClient(company);

    // 9️⃣ Contrato (El Negocio)
    await this.seedContract(company, property, client, taxIva, taxIrpf);

    this.logger.log('🚀 Seeding completado con éxito. Todo listo para probar.');
  }

  // ... (Tus métodos seedSuperAdmin, seedUserCompanyRole, etc. se mantienen igual) ...
  // ... (Solo pego los NUEVOS métodos para ahorrar espacio, asumiendo que los anteriores ya los tienes) ...

  /* ─────────────────────────────────────
   * FACTURAE PARTY GENÉRICO (Reutilizable)
   * ───────────────────────────────────── */
  private async seedFiscalIdentity(taxId: string, name: string, type: PersonType): Promise<FiscalIdentity> {
    let party = await this.fiscalIdentityRepo.findOne({ where: { taxId } });
    if (!party) {
      party = this.fiscalIdentityRepo.create({
        personType: type,
        corporateName: type === PersonType.LEGAL_ENTITY ? name : undefined,
        legalName: type === PersonType.INDIVIDUAL ? 'Juan' : undefined,
        legalSurname: type === PersonType.INDIVIDUAL ? 'Inquilino Pérez' : undefined,
        taxId,
        taxIdType: TaxIdType.NIF,
        residenceType: ResidenceType.RESIDENT,
        countryCode: 'ESP',
      });
      await this.fiscalIdentityRepo.save(party);
      this.logger.log(`✔ FiscalIdentity creada: ${taxId}`);
    }
    return party;
  }

  /* ─────────────────────────────────────
   * IMPUESTOS OPERATIVOS (Entity Tax)
   * Necesarios para vincular al contrato
   * ───────────────────────────────────── */
  private async seedOperationalTaxes(company: Company) {
    // IVA 21%
    let taxIva = await this.taxRepo.findOne({ where: { companyId: company.id, name: 'IVA General 21%' } });
    if (!taxIva) {
      taxIva = this.taxRepo.create({
        company,
        name: 'IVA General 21%',
        type: TaxType.VAT,
        rate: 21.00,
        code: 'IVA_21',
        isActive: true
      });
      await this.taxRepo.save(taxIva);
    }

    // IRPF 19%
    let taxIrpf = await this.taxRepo.findOne({ where: { companyId: company.id, name: 'IRPF Alquiler 19%' } });
    if (!taxIrpf) {
      taxIrpf = this.taxRepo.create({
        company,
        name: 'IRPF Alquiler 19%',
        type: TaxType.RETENTION,
        rate: 19.00,
        code: 'IRPF_19',
        isActive: true
      });
      await this.taxRepo.save(taxIrpf);
    }

    this.logger.log('✔ Impuestos operativos creados (IVA e IRPF)');
    return { taxIva, taxIrpf };
  }

  /* ─────────────────────────────────────
   * PROPIEDAD (Inmueble)
   * ───────────────────────────────────── */
  private async seedProperty(company: Company): Promise<Property> {
    const internalCode = 'P-MAD-001';
    let property = await this.propertyRepo.findOne({ where: { internalCode, companyId: company.id } });

    if (!property) {
      // 1. Crear dirección física del inmueble
      const address = this.addressRepo.create({
        companyId: company.id,
        type: AddressType.PROPERTY,
        addressLine1: 'Calle Gran Vía 45, 8ºA',
        city: 'Madrid',
        postalCode: '28013',
        province: 'Madrid',
        countryCode: 'ES',
        isDefault: false
      });
      await this.addressRepo.save(address);

      // 2. Crear propiedad
      property = this.propertyRepo.create({
        company,
        address, // Relación OneToOne
        internalCode,
        name: 'Ático Lujo Gran Vía',
        type: PropertyType.RESIDENTIAL,
        status: PropertyStatus.AVAILABLE,
        rentPrice: 1500.00,
        surfaceM2: 95.5,
        rooms: 2,
        bathrooms: 2,
        cadastralReference: '98765432101234'
      });
      await this.propertyRepo.save(property);
      this.logger.log('✔ Propiedad creada: Ático Gran Vía');
    }
    return property;
  }

  /* ─────────────────────────────────────
   * CLIENTE (Inquilino)
   * ───────────────────────────────────── */
  private async seedClient(company: Company): Promise<Client> {
    const nifInquilino = '12345678Z';
    // Buscamos o creamos la identidad fiscal del inquilino
    const fiscalIdentity = await this.seedFiscalIdentity(nifInquilino, 'Juan Inquilino', PersonType.INDIVIDUAL);

    let client = await this.clientRepo.findOne({
      where: { companyId: company.id, fiscalIdentity: { id: fiscalIdentity.id } }
    });

    if (!client) {
      // 1. Dirección del cliente (donde vive antes de mudarse)
      const address = this.addressRepo.create({
        companyId: company.id, // OJO: La dirección pertenece al ámbito de la empresa que gestiona el dato
        type: AddressType.FISCAL,
        addressLine1: 'Calle Antigua 10',
        city: 'Barcelona',
        postalCode: '08001',
        countryCode: 'ES'
      });
      await this.addressRepo.save(address);

      // 2. Crear Cliente
      client = this.clientRepo.create({
        company,
        fiscalIdentity,
        address,
        internalCode: 'CLI-001',
        email: 'juan.inquilino@email.com',
        phoneNumber: '+34600123456',
        status: ClientStatus.ACTIVE,
        // Aquí podrías meter las cuentas bancarias si el DTO lo permite, 
        // pero suelen ir en una entidad aparte o columna simple
      });
      await this.clientRepo.save(client);
      this.logger.log('✔ Cliente creado: Juan Inquilino');
    }
    return client;
  }

  /* ─────────────────────────────────────
   * CONTRATO (Alquiler) - VERSIÓN DEBUG
   * ───────────────────────────────────── */
  private async seedContract(
    company: Company, 
    property: Property, 
    client: Client,
    taxIva: Tax,
    taxIrpf: Tax
  ): Promise<void> {
    const reference = 'CON-2026/001';
    
    try {
      // 1. Verificar si ya existe
      const existing = await this.contractRepo.findOne({ where: { reference, companyId: company.id } });
      if (existing) {
        this.logger.log(`ℹ El contrato ${reference} ya existe. Saltando...`);
        return;
      }

      this.logger.log(`🛠 Intentando crear contrato para: Propiedad ${property.id}, Cliente ${client.id}, Tax ${taxIva.id}...`);

      // 2. Crear instancia
      const contract = this.contractRepo.create({
        company,
        property,
        client,
        tax: taxIva,
        retention: taxIrpf,
        
        reference,
        type: ContractType.ALQUILER,
        status: ContractStatus.ACTIVO,
        
        // Economía
        monthlyRent: 1500.00,
        depositAmount: 3000.00,
        
        // Operativa
        paymentMethod: PaymentMethod.DOMICILIACION,
        billingDay: 1,
        billingPeriod: BillingPeriod.MENSUAL,
        
        // Fechas
        startDate: new Date('2026-01-01'),
        endDate: new Date('2027-01-01'),
        
        // Automatización
        isAutoBillingEnabled: true,
        autoBillingUntil: new Date('2027-01-01'),
      });

      // 3. Guardar
      await this.contractRepo.save(contract);
      this.logger.log('✔ Contrato creado EXITOSAMENTE');

    } catch (error) {
      this.logger.error(`❌ ERROR CREANDO CONTRATO: ${error.message}`, error.stack);
    }
  }

  // --- MÉTODOS AUXILIARES QUE YA TENÍAS (seedCompany, seedVatRatesES...) MANTENLOS ---
  private async seedSuperAdmin(): Promise<User> {
    let user = await this.userRepo.findOne({ where: { email: 'admin@rentix.com' } });
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
      this.logger.log('✔ Superadmin creado');
    }
    return user;
  }

  private async seedCompanyWithFiscalAddress(facturaeParty: FiscalIdentity, createdBy: User): Promise<Company> {
    let company = await this.companyRepo.findOne({ where: { facturaeParty: { id: facturaeParty.id } } });
    if (!company) {
      company = this.companyRepo.create({ facturaeParty, createdByUserId: createdBy.id });
      await this.companyRepo.save(company);

      const address = this.addressRepo.create({
        companyId: company.id,
        type: AddressType.FISCAL,
        addressLine1: 'Calle Demo Fiscal 1',
        postalCode: '28001',
        city: 'Madrid',
        countryCode: 'ES',
        isDefault: true
      });
      await this.addressRepo.save(address);
      company.fiscalAddress = address;
      await this.companyRepo.save(company);
      this.logger.log('✔ Empresa creada');
    }
    return company;
  }

  private async seedUserCompanyRole(user: User, company: Company): Promise<void> {
    const exists = await this.userCompanyRoleRepo.findOne({ where: { user: { id: user.id }, company: { id: company.id } } });
    if (!exists) {
      await this.userCompanyRoleRepo.save(this.userCompanyRoleRepo.create({ user, company, role: CompanyRole.OWNER }));
      this.logger.log('✔ Rol Owner asignado');
    }
  }

  private async seedVatRatesES(): Promise<void> { /* ... tu código ... */ }
  private async seedWithholdingRatesES(): Promise<void> { /* ... tu código ... */ }
}