import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DataSource, Repository, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Company } from './entities/company.entity';
import { FiscalEntity } from 'src/fiscal/entities/fiscal.entity';
import { Address } from 'src/address/entities/address.entity';
import { CreateCompanyLegalDto, UpdateCompanyDto } from './dto';
import { CompanyRoleEntity } from '../user-company-role/entities/user-company-role.entity';
import { CompanyRole } from 'src/user-company-role/enums/user-company-role.enum';
import { AppRole } from 'src/auth/enums/user-global-role.enum';
import { AddressType } from 'src/address/enums/address-type.enum';

/**
 * @class CompanyService
 * @description Gestión patrimonial con persistencia atómica y aislamiento Multi-Tenant.
 * Implementa el Bypass de infraestructura para SUPERADMIN (Modo Dios).
 * @version 2026.2.3
 * @author Rentix 2026
 */
@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);
  private readonly relations = ['fiscalEntity', 'fiscalAddress'];

  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * @method createCompany
   * @description Orquestador transaccional para el alta de nuevos patrimonios.
   * Crea en un solo paso: Dirección + Fiscal + Empresa + Rol de Dueño.
   */
  async createCompany(dto: CreateCompanyLegalDto, role: CompanyRole = CompanyRole.OWNER): Promise<Company> {
    return await this.dataSource.transaction(async (manager: EntityManager): Promise<Company> => {
      try {
        // 1. Persistencia de Dirección Fiscal
        const addressInstance = manager.create(Address, { 
          ...dto.address, 
          isDefault: true,
          type: AddressType.FISCAL 
        });
        const savedAddress = await manager.save(addressInstance);

        // 2. Persistencia de Identidad Fiscal
        const fiscalInstance = manager.create(FiscalEntity, { ...dto.fiscal });
        const savedFiscal = await manager.save(fiscalInstance);

        // 3. Creación de la Entidad Empresa (Tenant)
        const companyInstance = manager.create(Company, {
          ...dto.company,
          fiscalEntityId: savedFiscal.id,
          fiscalAddressId: savedAddress.id,
          createdByUserId: dto.userId, // El usuario que será dueño legal
          isActive: true, // Nacimiento operativo por defecto
        });
        const savedCompany = await manager.save(companyInstance);

        // 4. Asignación del Rol de Autoridad
        const roleInstance = manager.create(CompanyRoleEntity, {
          userId: dto.userId,
          companyId: savedCompany.id,
          role: role,
        });
        await manager.save(roleInstance);

        this.logger.log(`[Rentix Infrastructure] Patrimonio creado: ${savedCompany.id} para Owner: ${dto.userId}`);
        
        // Retornamos el objeto completo con relaciones cargadas
        const finalCompany = await manager.findOne(Company, {
          where: { id: savedCompany.id },
          relations: this.relations
        });

        if (!finalCompany) throw new Error('Error al recuperar la empresa tras la creación');
        return finalCompany;

      } catch (error: any) {
        this.logger.error(`Fallo en transacción: ${error.message}`);
        throw new InternalServerErrorException('Fallo en la creación atómica del patrimonio');
      }
    });
  }

  /**
   * @method findAll
   * @description Recupera empresas con discriminación de rol.
   * Los usuarios normales NO ven empresas inactivas. El SA ve TODO.
   */
  async findAll(userId: string, appRole: AppRole): Promise<Company[]> {
    const isSA = appRole === AppRole.SUPERADMIN;

    return await this.companyRepository.find({
      where: isSA 
        ? {} 
        : { companyRoles: { userId }, isActive: true },
      relations: this.relations,
      withDeleted: isSA,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * @method findOne
   * @description Detalle de empresa con búnker de seguridad.
   * Si la empresa está inactiva y el usuario no es SA, el acceso es bloqueado.
   */
  async findOne(id: string, userId: string, appRole: AppRole): Promise<Company> {
    const isSA = appRole === AppRole.SUPERADMIN;
    
    const company = await this.companyRepository.findOne({
      where: isSA ? { id } : { id, companyRoles: { userId } },
      relations: this.relations,
      withDeleted: isSA,
    });

    if (!company) {
      throw new NotFoundException('Patrimonio no localizado o sin permisos de acceso.');
    }

    // EL RIGOR: Bloqueo de acceso a entidades suspendidas para no-SA
    if (!company.isActive && !isSA) {
      throw new ForbiddenException('Entidad legal suspendida. Contacte con soporte técnico de Rentix.');
    }

    return company;
  }

  /**
   * @method update
   * @description Actualización de metadatos con blindaje de estado.
   */
  async update(
    id: string,
    updateDto: UpdateCompanyDto,
    userId: string,
    appRole: AppRole,
  ): Promise<Company> {
    const company = await this.findOne(id, userId, appRole);

    // Evitar escalada de privilegios: Solo el SA puede cambiar el estado operativo aquí
    if (appRole !== AppRole.SUPERADMIN) {
      delete (updateDto as any).isActive;
      delete (updateDto as any).deletedAt;
    }

    const updatedCompany = this.companyRepository.merge(company, updateDto);
    return await this.companyRepository.save(updatedCompany);
  }

  /**
   * @method toggleStatus
   * @description Kill-Switch de monetización (Activar/Suspender).
   * Solo ejecutable por SUPERADMIN.
   */
  async toggleStatus(id: string, activate: boolean): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: this.relations
    });

    if (!company) throw new NotFoundException('Entidad no localizada en infraestructura.');

    company.isActive = activate;
    company.deletedAt = activate ? null : new Date();

    try {
      const saved = await this.companyRepository.save(company);
      this.logger.warn(`MODO DIOS: Estado de empresa ${id} cambiado a ${activate ? 'ACTIVO' : 'SUSPENDIDO'}`);
      return saved;
    } catch (error: any) {
      this.logger.error(`Error al transicionar estado: ${error.message}`);
      throw new InternalServerErrorException(`Fallo al transicionar estado a ${activate}`);
    }
  }

  private handleError(error: any, customMessage: string): never {
    const message = error instanceof Error ? error.message : 'Internal Logic Error';
    this.logger.error(`${customMessage}: ${message}`);
    throw new InternalServerErrorException(customMessage);
  }
}