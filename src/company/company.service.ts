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
   * Crea una empresa en una transacción:
   * 1. Vincula la identidad legal (FacturaeParty)
   * 2. Vincula la dirección fiscal y la activa
   * 3. Crea la empresa con auditoría
   * 4. Asigna al creador el rol de OWNER
   */
  async createCompany(dto: CreateCompanyDto, ownerUserId: string): Promise<Company> {
    return this.dataSource.transaction(async (manager) => {
      const facturaeParty = await manager.findOne(FiscalIdentity, {
        where: { id: dto.facturaePartyId }, // isActive no existe en BaseEntity por defecto, revisa si lo tienes
      });
      if (!facturaeParty) throw new NotFoundException('Identidad fiscal no encontrada');

      const fiscalAddress = await manager.findOne(Address, {
        where: { id: dto.fiscalAddressId, isActive: true },
      });
      if (!fiscalAddress) throw new NotFoundException('Dirección fiscal no encontrada');

      if (fiscalAddress.companyId) {
        throw new ConflictException('La dirección fiscal ya está asociada a otra empresa');
      }

      const company = manager.create(Company, { 
        facturaeParty, 
        fiscalAddress,
        createdByUserId: ownerUserId 
      });
      await manager.save(company);

      fiscalAddress.companyId = company.id;
      fiscalAddress.status = AddressStatus.ACTIVE;
      await manager.save(fiscalAddress);

      const ownerRole = manager.create(CompanyRoleEntity, {
        user: { id: ownerUserId } as any, 
        company,
        role: CompanyRole.OWNER,
      });
      await manager.save(ownerRole);

      return company;
    });
  }

  /**
   * Retorna las empresas vinculadas al usuario para el dashboard 'Mis Empresas'
   */
  async getCompaniesForUser(userId: string): Promise<CompanyMeDto[]> {
    const relations = await this.userCompanyRoleRepo.find({
      where: { user: { id: userId } as any, isActive: true },
      relations: ['company', 'company.facturaeParty', 'company.companyRoles', 'company.companyRoles.user'],
    });

    return relations.map((r) => {
      const owner = r.company.companyRoles.find(
        (cr) => cr.role === CompanyRole.OWNER
      );

      return {
        companyId: r.company.id,
        // 👇 CORRECCIÓN: Usamos el getter inteligente de la entidad
        legalName: r.company.facturaeParty?.facturaeName || 'Nombre no disponible',
        tradeName: r.company.facturaeParty?.tradeName || 'N/A',
        taxId: r.company.facturaeParty?.taxId || 'N/A',
        ownerEmail: owner?.user?.email ?? '',
        role: r.role as unknown as CompanyRole,
      };
    });
  }

  /**
   * Listado global (Solo accesible si el Guard permitió el paso a SUPERADMIN)
   */
  async findAll(): Promise<Company[]> {
    return this.companyRepo.find({
      where: { isActive: true },
      relations: ['facturaeParty', 'fiscalAddress'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtiene una empresa validando si el usuario tiene permiso de verla
   */
  async findOneWithAccess(id: string, userId: string, appRole: AppRole): Promise<Company> {
    const company = await this.companyRepo.findOne({
      where: { id, isActive: true },
      relations: ['facturaeParty', 'fiscalAddress'],
    });

    if (!company) throw new NotFoundException('Empresa no encontrada');

    // SUPERADMIN ve todo por defecto
    if (appRole === AppRole.SUPERADMIN) return company;

    // Verificación de relación en la tabla de roles
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

  /**
   * Actualiza datos validando que sea el Propietario o un Admin Global
   */
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

  /**
   * Borrado lógico de empresa
   */
  async softDeleteWithAccess(id: string, userId: string, appRole: AppRole): Promise<void> {
    // Validamos permisos (si puede editar, puede borrar)
    await this.updateWithAccess(id, {}, userId, appRole);

    await this.companyRepo.update(id, { 
      isActive: false, 
      deletedAt: new Date() 
    });
  }

  /**
   * Miembros de la empresa
   */
  async getCompanyMembers(companyId: string): Promise<any[]> {
    const members = await this.userCompanyRoleRepo.find({
      where: { company: { id: companyId } as any, isActive: true },
      relations: ['user'],
    });

    return members.map(m => ({
      userId: m.user.id,
      email: m.user.email,
      // NOTA: Aquí usamos m.user (Usuario del login), no FiscalIdentity,
      // por lo que firstName/lastName SÍ existen en la entidad User.
      fullName: `${m.user.firstName || ''} ${m.user.lastName || ''}`.trim(),
      role: m.role,
      since: m.createdAt
    }));
  }
}