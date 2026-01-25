import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

// Entidades - Rutas ajustadas según el backend.xml
import { User } from 'src/user/entities/user.entity';
import { Company } from 'src/company/entities/company.entity';
import { FiscalEntity } from 'src/fiscal/entities/fiscal.entity';
import { Property } from 'src/property/entities/property.entity';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { Contract } from 'src/contract/entities/contract.entity';
import { Tax } from 'src/tax/entities/tax.entity';
import { Address } from 'src/address/entities/address.entity';

// Enums
import { AppRole } from 'src/auth/enums/user-global-role.enum';
import { PersonType } from 'src/fiscal/enums/personType.enum';
import { AddressStatus } from 'src/address/enums';
import { TaxType } from 'src/tax/enums/tax-type.enum';
import { PropertyType, PropertyStatus } from 'src/property/enums';
import { TenantStatus } from 'src/tenant/enums/tenant-status.enum';
import { ContractStatus, PaymentFrequency, PaymentMethod } from 'src/contract/enums';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
  ) { }

  async seed(): Promise<void> {
    this.logger.log('🚀 [Rentix 2026] Iniciando protocolo de Seeding...');
    try {
      const admin = await this.seedSuperAdmin();
      await this.seedBusinessEnvironment(admin);
      this.logger.log('🏁 [Rentix 2026] Seeding completado con éxito.');
    } catch (error) {
      this.logger.error(`❌ [Critical] Fallo en el arranque: ${error.message}`);
    }
  }

  private async seedSuperAdmin(): Promise<User> {
    const email = 'admin@rentix.com';
    const existingUser = await this.userRepo.findOne({ where: { email } });

    if (existingUser) return existingUser;

    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    // Creamos la instancia
    const superAdmin = this.userRepo.create({
      email,
      password: hashedPassword,
      appRole: AppRole.SUPERADMIN,
      firstName: 'System',
      lastName: 'Admin',
      isActive: true,
      isEmailVerified: true,
    } as Partial<User>);

    // Forzamos el retorno como User único para que TS no espere un User[]
    return await this.userRepo.save(superAdmin as User);
  }

  private async seedBusinessEnvironment(admin: User): Promise<void> {
    const companyRepo = this.dataSource.getRepository(Company);
    const existing = await companyRepo.findOne({ where: { createdByUserId: admin.id } });
    if (existing) return;

    this.logger.log('🏗️ [Seed] Generando ecosistema de facturación...');

    await this.dataSource.transaction(async (manager) => {
      // 1. Dirección con tipado fuerte
      const address = await manager.save(Address, {
        street: 'Paseo de la Castellana 100',
        city: 'Madrid',
        postalCode: '28046',
        status: AddressStatus.ACTIVE,
      } as any);

      // 2. Entidad Fiscal (Corrección del error TS2769)
      const fiscalEntity = await manager.save(FiscalEntity, {
        nif: 'B12345678',
        nombreRazonSocial: 'Rentix Inmuebles S.L.',
        tipoPersona: PersonType.LEGAL_ENTITY,
        codigoPais: 'ESP',
      } as any);

      // 3. Empresa
      const company = await manager.save(Company, {
        personType: PersonType.LEGAL_ENTITY,
        createdByUserId: admin.id,
        fiscalEntityId: fiscalEntity.id,
        fiscalAddressId: address.id,
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
      const property = await manager.save(Property, {
        companyId: company.id,
        internalCode: 'P-TEST',
        type: PropertyType.RESIDENTIAL,
        status: PropertyStatus.AVAILABLE,
        address: await manager.save(Address, {
          street: 'Calle Mayor 1',
          city: 'Madrid',
          postalCode: '28001',
          status: AddressStatus.ACTIVE
        } as any)
      } as any);

      // 6. Tenant
      const tenant = await manager.save(Tenant, {
        companyId: company.id,
        name: 'Inquilino de Prueba',
        email: 'tenant@test.com',
        status: TenantStatus.ACTIVE,
      } as any);

      // 7. Contrato (Ligando los impuestos reales)
      await manager.save(Contract, {
        companyId: company.id,
        propertyId: property.id,
        tenants: [tenant],
        baseRent: 1000,
        status: ContractStatus.ACTIVE,
        taxIvaId: taxIva.id, // Usamos la columna de ID directamente
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