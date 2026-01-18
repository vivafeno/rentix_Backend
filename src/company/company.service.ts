import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, Repository, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Company } from './entities/company.entity';
import { FiscalEntity } from 'src/fiscal/entities/fiscalEntity';
import { Address } from 'src/address/entities/address.entity';
import { CreateCompanyLegalDto, UpdateCompanyDto } from './dto';
import { CompanyRoleEntity } from '../user-company-role/entities/userCompanyRole.entity';
import { CompanyRole } from 'src/user-company-role/entities/userCompanyRole.entity';

/**
 * @description Servicio de gestión patrimonial con aislamiento de datos y persistencia atómica.
 * Alineado con estándares Veri*factu 2026 para la integridad de datos fiscales.
 * @author Rentix 2026
 * @version 2.2.0
 */
@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly dataSource: DataSource,
  ) { }

  /**
   * @description Orquestador central para el alta de sujetos legales (Owners, Tenants, Viewers).
   * @param {CreateCompanyLegalDto} dto - Datos de identidad, fiscales y dirección.
   * @param {CompanyRole} role - Rol patrimonial a asignar.
   * @returns {Promise<Company>} Entidad de empresa creada.
   */
  private async createAtomicCompany(dto: CreateCompanyLegalDto, role: CompanyRole): Promise<Company> {
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      try {
        // 1. Persistencia de Dirección (Nomenclatura Veri*factu)
        const address = await manager.save(
          manager.create(Address, {
            ...dto.address,
            isDefault: true,
          })
        );

        // 2. Persistencia de Entidad Fiscal (Mapeo directo NIF/Nombre)
        const fiscal = await manager.save(
          manager.create(FiscalEntity, {
            ...dto.fiscal,
          })
        );

        // 3. Creación de la Compañía (Vínculo de llaves foráneas actualizadas)
        const company = await manager.save(
          manager.create(Company, {
            ...(dto.company || {}),
            fiscalEntityId: fiscal.id, // Refactorizado: de facturaePartyId
            fiscalAddressId: address.id,
            createdByUserId: dto.userId,
          })
        );

        // 4. Asignación de Rol de Empresa (Contexto Patrimonial)
        await manager.save(
          manager.create(CompanyRoleEntity, {
            userId: dto.userId,
            companyId: company.id,
            role: role,
          })
        );

        return company;
      } catch (error) {
        this.logger.error(`Error en transacción atómica: ${error.message}`);
        throw new InternalServerErrorException('Fallo en la persistencia del bloque legal');
      }
    });
  }

  /**
   * @description Alta de propietario con infraestructura legal completa.
   */
  async createOwner(dto: CreateCompanyLegalDto): Promise<Company> {
    return this.createAtomicCompany(dto, CompanyRole.OWNER);
  }

  /**
   * @description Alta de inquilino con infraestructura legal completa.
   */
  async createTenant(dto: CreateCompanyLegalDto): Promise<Company> {
    return this.createAtomicCompany(dto, CompanyRole.TENANT);
  }

  /**
   * @description Alta de gestor/asesor con infraestructura legal completa.
   */
  async createViewer(dto: CreateCompanyLegalDto): Promise<Company> {
    return this.createAtomicCompany(dto, CompanyRole.VIEWER);
  }

  /**
   * @description Obtiene listado de empresas aplicando jerarquía de roles (Bypass SUPERADMIN).
   * @param {string} userId - ID del usuario activo.
   * @param {string} appRole - Rol de aplicación.
   * @returns {Promise<Company[]>}
   */
  async findAllByUser(userId: string, appRole: string): Promise<Company[]> {
    const relations = ['fiscalEntity', 'fiscalAddress']; // Sincronizado con nombres de la entidad

    if (appRole === 'SUPERADMIN') {
      return this.companyRepository.find({
        relations,
        order: { createdAt: 'DESC' }
      });
    }

    return this.companyRepository.find({
      where: { companyRoles: { userId } },
      relations,
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * @description Obtiene una empresa específica validando acceso.
   * @param {string} id - ID de la empresa.
   * @param {string} userId - ID del usuario.
   * @param {string} appRole - Rol de aplicación.
   */
  async findOne(id: string, userId: string, appRole: string): Promise<Company> {
    const relations = ['fiscalEntity', 'fiscalAddress'];
    const whereCondition = appRole === 'SUPERADMIN' 
      ? { id } 
      : { id, companyRoles: { userId } };

    const company = await this.companyRepository.findOne({
      where: whereCondition,
      relations,
    });

    if (!company) throw new NotFoundException('Patrimonio no encontrado o acceso denegado');
    return company;
  }

  /**
   * @description Actualiza datos de empresa previa validación de permisos.
   */
  async update(id: string, updateDto: UpdateCompanyDto, userId: string, appRole: string): Promise<Company> {
    const company = await this.findOne(id, userId, appRole);
    const updated = Object.assign(company, updateDto);
    return this.companyRepository.save(updated);
  }

  /**
   * @description Eliminación lógica de empresa.
   */
  async remove(id: string, userId: string, appRole: string): Promise<void> {
    const company = await this.findOne(id, userId, appRole);
    await this.companyRepository.softRemove(company);
  }
}