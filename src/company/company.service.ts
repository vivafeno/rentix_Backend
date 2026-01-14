import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Company } from './entities/company.entity';
import { CreateCompanyDto, CompanyMeDto } from './dto';

import { FiscalIdentity } from 'src/facturae/entities/fiscalIdentity.entity';
import { Address } from 'src/address/entities/address.entity';
import { AddressStatus } from 'src/address/enums/addressStatus.enum';

import { CompanyRole } from 'src/user-company-role/enums/companyRole.enum';
import { AppRole } from 'src/auth/enums/user-global-role.enum';
import { CompanyRoleEntity } from 'src/user-company-role/entities/userCompanyRole.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,

    @InjectRepository(CompanyRoleEntity)
    private readonly userCompanyRoleRepo: Repository<CompanyRoleEntity>,

    private readonly dataSource: DataSource,
  ) { }

  /**
   * Crea una empresa siguiendo el flujo:
   * 1. Valida Identidad Fiscal (Paso 3)
   * 2. Valida y activa Dirección (Paso 2)
   * 3. Crea Empresa vinculada al User (Paso 1) como OWNER
   */
  async createCompany(dto: CreateCompanyDto, creatorUserId: string): Promise<Company> {
    return this.dataSource.transaction(async (manager) => {

      // 1. Validar Identidad Fiscal
      const facturaeParty = await manager.findOne(FiscalIdentity, {
        where: { id: dto.facturaePartyId },
      });
      if (!facturaeParty) throw new NotFoundException('Identidad fiscal no encontrada');

      // 2. Validar Dirección
      const fiscalAddress = await manager.findOne(Address, {
        where: { id: dto.fiscalAddressId, isActive: true },
      });
      if (!fiscalAddress) throw new NotFoundException('Dirección fiscal no encontrada');

      if (fiscalAddress.companyId) {
        throw new ConflictException('La dirección fiscal ya está asociada a otra empresa');
      }

      // 3. Crear la Empresa
      // Usamos el userId del DTO (el owner elegido) para el rol, 
      // y el creatorUserId (SuperAdmin) para la auditoría createdBy.
      const company = manager.create(Company, {
        facturaeParty,
        fiscalAddress,
        createdByUserId: creatorUserId
      });
      await manager.save(company);

      // 4. Vincular dirección a la empresa y activarla
      fiscalAddress.companyId = company.id;
      fiscalAddress.status = AddressStatus.ACTIVE;
      await manager.save(fiscalAddress);

      // 5. VÍNCULO MAESTRO: Asignar rol de OWNER al usuario del Paso 1
      const ownerRole = manager.create(CompanyRoleEntity, {
        user: { id: dto.userId } as any,
        company,
        role: CompanyRole.OWNER,
        isActive: true
      });
      await manager.save(ownerRole);

      return company;
    });
  }

  /**
   * Retorna las empresas vinculadas al usuario (Login Context)
   */
  async getCompaniesForUser(userId: string, appRole: AppRole): Promise<CompanyMeDto[]> {
    let companies: Company[];

    if (appRole === AppRole.SUPERADMIN) {
      // Si es SuperAdmin, traemos TODAS las empresas del sistema
      companies = await this.companyRepo.find({
        where: { isActive: true },
        relations: ['facturaeParty', 'companyRoles', 'companyRoles.user'],
      });
    } else {
      // Si es un usuario normal, buscamos solo sus vínculos
      const relations = await this.userCompanyRoleRepo.find({
        where: { user: { id: userId } as any, isActive: true },
        relations: ['company', 'company.facturaeParty', 'company.companyRoles', 'company.companyRoles.user'],
      });
      companies = relations.map(r => r.company);
    }

    return companies.map((company) => {
      const owner = company.companyRoles.find(cr => cr.role === CompanyRole.OWNER);

      // Buscamos el rol del usuario actual en esta empresa (si no es SuperAdmin)
      // Para el SuperAdmin, podemos mostrar 'SUPERADMIN' o 'OWNER'
      const userRole = company.companyRoles.find(cr => cr.user?.id === userId)?.role;

      return {
        companyId: company.id,
        legalName: company.facturaeParty?.corporateName || company.facturaeParty?.facturaeName || 'Nombre no disponible',
        tradeName: company.facturaeParty?.tradeName || 'N/A',
        taxId: company.facturaeParty?.taxId || 'N/A',
        ownerEmail: owner?.user?.email ?? 'Sin propietario',
        role: (appRole === AppRole.SUPERADMIN ? 'SUPERADMIN' : userRole) as unknown as CompanyRole,
      };
    });
  }

  async findAll(): Promise<Company[]> {
    return this.companyRepo.find({
      where: { isActive: true },
      relations: ['facturaeParty', 'fiscalAddress'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneWithAccess(id: string, userId: string, appRole: AppRole): Promise<Company> {
    const company = await this.companyRepo.findOne({
      where: { id, isActive: true },
      relations: ['facturaeParty', 'fiscalAddress'],
    });

    if (!company) throw new NotFoundException('Empresa no encontrada');
    if (appRole === AppRole.SUPERADMIN) return company;

    const hasAccess = await this.userCompanyRoleRepo.findOne({
      where: {
        user: { id: userId } as any,
        company: { id } as any,
        isActive: true
      }
    });

    if (!hasAccess) throw new ForbiddenException('No tienes permiso para ver esta empresa');

    return company;
  }

  async updateWithAccess(id: string, updateDto: any, userId: string, appRole: AppRole): Promise<Company> {
    const company = await this.findOneWithAccess(id, userId, appRole);

    if (appRole !== AppRole.SUPERADMIN) {
      const ownerRole = await this.userCompanyRoleRepo.findOne({
        where: { user: { id: userId } as any, company: { id } as any, role: CompanyRole.OWNER }
      });
      if (!ownerRole) throw new ForbiddenException('Solo el propietario (OWNER) puede editar esta empresa');
    }

    const updatedCompany = this.companyRepo.merge(company, updateDto);
    return this.companyRepo.save(updatedCompany);
  }

  async softDeleteWithAccess(id: string, userId: string, appRole: AppRole): Promise<void> {
    await this.updateWithAccess(id, {}, userId, appRole);
    await this.companyRepo.update(id, {
      isActive: false,
      deletedAt: new Date()
    });
  }

  async getCompanyMembers(companyId: string): Promise<any[]> {
    const members = await this.userCompanyRoleRepo.find({
      where: { company: { id: companyId } as any, isActive: true },
      relations: ['user'],
    });

    return members.map(m => ({
      userId: m.user.id,
      email: m.user.email,
      fullName: `${m.user.firstName || ''} ${m.user.lastName || ''}`.trim(),
      role: m.role,
      since: m.createdAt
    }));
  }
}