import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

// Entidades
import { User } from 'src/user/entities/user.entity';
import { Company } from 'src/company/entities/company.entity';
import { FiscalEntity } from 'src/fiscal/entities/fiscal.entity';
import { Property } from 'src/property/entities/property.entity';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { TenantProfile } from 'src/tenant-profile/entities/tenant-profile.entity';
import { Contract } from 'src/contract/entities/contract.entity';
import { Tax } from 'src/tax/entities/tax.entity';
import { Address } from 'src/address/entities/address.entity';
import { CompanyRoleEntity } from 'src/user-company-role/entities/user-company-role.entity';

// Enums
import { AppRole } from 'src/auth/enums/user-global-role.enum';
import { PersonType } from 'src/fiscal/enums/person-type.enum';
import { AddressStatus } from 'src/address/enums';
import { TaxType } from 'src/tax/enums/tax-type.enum';
import { PropertyType, PropertyStatus } from 'src/property/enums';
import { TenantStatus } from 'src/tenant/enums/tenant-status.enum';
import { ContractStatus, PaymentFrequency, PaymentMethod } from 'src/contract/enums';
import { CompanyRole } from 'src/user-company-role/enums/user-company-role.enum';

// Servicios
import { InvoiceCronService } from 'src/invoice/invoice-cron.service';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly invoiceCronService: InvoiceCronService,
  ) { }

  async seed(): Promise<void> {
    this.logger.log('🚀 [Rentix 2026] Iniciando protocolo de Seeding...');
    try {
      // 1. Crear el SuperAdmin (Gestión Global)
      await this.seedUser('admin@rentix.com', AppRole.SUPERADMIN, 'System', 'Admin');

      // 2. Crear el Usuario Propietario (Gestión de Empresa)
      const owner = await this.seedUser('owner@rentix.com', AppRole.USER, 'Juan', 'Propietario');

      // 3. Crear el ecosistema vinculado al Propietario
      await this.seedBusinessEnvironment(owner);

      // 4. Ejecutar facturación inicial
      this.logger.log('📄 [Seed] Ejecutando ciclo de facturación mensual...');
      await this.invoiceCronService.handleAutoBilling();

      this.logger.log('🏁 [Rentix 2026] Seeding completado con éxito.');
    } catch (error: any) {
      this.logger.error(`❌ [Critical] Fallo en el arranque: ${error.message}`);
    }
  }

  private async seedUser(email: string, appRole: AppRole, firstName: string, lastName: string): Promise<User> {
    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) return existingUser;

    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    const user = this.userRepo.create({
      email,
      password: hashedPassword,
      appRole,
      firstName,
      lastName,
      isActive: true,
      isEmailVerified: true,
    } as Partial<User>);

    return await this.userRepo.save(user);
  }

  private async seedBusinessEnvironment(owner: User): Promise<void> {
    const companyRepo = this.dataSource.getRepository(Company);
    const existing = await companyRepo.findOne({ where: { createdByUserId: owner.id } });
    if (existing) return;

    this.logger.log(`🏗️ [Seed] Generando ecosistema para: ${owner.email}`);

    await this.dataSource.transaction(async (manager) => {
      // 1. Dirección Fiscal
      const address = await manager.save(Address, {
        street: 'Paseo de la Castellana 100',
        city: 'Madrid',
        postalCode: '28046',
        status: AddressStatus.ACTIVE,
      } as any);

      // 2. Entidad Fiscal (Emisor)
      const fiscalEntity = await manager.save(FiscalEntity, {
        nif: 'B12345678',
        nombreRazonSocial: 'Rentix Inmuebles S.L.',
        tipoPersona: PersonType.LEGAL_ENTITY,
        codigoPais: 'ES',
      } as any);

      // 3. Empresa vinculada al Owner
      const company = await manager.save(Company, {
        personType: PersonType.LEGAL_ENTITY,
        createdByUserId: owner.id,
        fiscalEntityId: fiscalEntity.id,
        fiscalAddressId: address.id,
        isActive: true,
      } as any);

      // 🚩 RIGOR: Vincular al Usuario con la Empresa con Rol OWNER
      await manager.save(CompanyRoleEntity, {
        userId: owner.id,
        companyId: company.id,
        role: CompanyRole.OWNER,
        isPrimary: true,
        isActive: true,
      } as any);

      // 4. Impuestos
      const taxIva = await manager.save(Tax, {
        companyId: company.id,
        nombre: 'IVA 21%',
        tipo: TaxType.IVA,
        porcentaje: 21,
        esRetencion: false,
      } as any);

      const taxIrpf = await manager.save(Tax, {
        companyId: company.id,
        nombre: 'Retención 19%',
        tipo: TaxType.IRPF,
        porcentaje: 19,
        esRetencion: true,
      } as any);

      // 5. Inmueble
      const propAddress = await manager.save(Address, {
        street: 'Calle Mayor 1',
        city: 'Madrid',
        postalCode: '28001',
        status: AddressStatus.ACTIVE,
      } as any);

      const property = await manager.save(Property, {
        companyId: company.id,
        internalCode: 'P-TEST',
        type: PropertyType.RESIDENTIAL,
        status: PropertyStatus.AVAILABLE,
        addressId: propAddress.id,
      } as any);

      // 6. Inquilino y Perfil Fiscal (Receptor)
      const tenant = await manager.save(Tenant, {
        companyId: company.id,
        name: 'Inquilino de Prueba',
        email: 'tenant@test.com',
        status: TenantStatus.ACTIVE,
      } as any);

      const tenantFiscal = await manager.save(FiscalEntity, {
        nif: '44444444H',
        nombreRazonSocial: 'Juan Inquilino S.A.',
        tipoPersona: PersonType.INDIVIDUAL,
        codigoPais: 'ES',
      } as any);

      const tenantProfile = await manager.save(TenantProfile, {
        companyId: company.id,
        tenantId: tenant.id,
        fiscalIdentityId: tenantFiscal.id,
        internalCode: 'CLIP-001',
        isActive: true,
      } as any);

      // 7. Contrato
      await manager.save(Contract, {
        companyId: company.id,
        propertyId: property.id,
        tenants: [tenant],
        baseRent: 1000,
        status: ContractStatus.ACTIVE,
        taxIvaId: taxIva.id,
        taxIrpfId: taxIrpf.id,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        paymentFrequency: PaymentFrequency.MONTHLY,
        paymentMethod: PaymentMethod.TRANSFER,
        isActive: true
      } as any);
    });
  }
}