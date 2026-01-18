import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Company } from './entities/company.entity';
import { FiscalEntity } from 'src/fiscal/entities/fiscalEntity';
import { Address } from 'src/address/entities/address.entity';
import { CreateCompanyLegalDto, UpdateCompanyDto } from './dto';
import { CompanyRoleEntity } from '../user-company-role/entities/userCompanyRole.entity';
import { CompanyRole } from 'src/user-company-role/enums/companyRole.enum';
import { AppRole } from 'src/auth/enums/user-global-role.enum';

/**
 * @class CompanyService
 * @description Servicio de gestión patrimonial con aislamiento de datos y persistencia atómica.
 * Implementa el estándar Rentix 2026 para garantizar la integridad de sujetos legales.
 * @version 2.2.1
 * @author Rentix
 */
@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * @method createAtomicCompany
   * @description Orquestador central para el alta de sujetos legales mediante transacciones atómicas.
   * Resuelve errores de linter mediante tipado de errores desconocidos.
   */
  private async createAtomicCompany(
    dto: CreateCompanyLegalDto,
    role: CompanyRole,
  ): Promise<Company> {
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      try {
        // 1. Persistencia de Dirección
        const address = await manager.save(
          manager.create(Address, {
            ...dto.address,
            isDefault: true,
          }),
        );

        // 2. Persistencia de Entidad Fiscal
        const fiscal = await manager.save(
          manager.create(FiscalEntity, {
            ...dto.fiscal,
          }),
        );

        // 3. Creación de la Compañía
        const company = await manager.save(
          manager.create(Company, {
            ...(dto.company || {}),
            fiscalEntityId: fiscal.id,
            fiscalAddressId: address.id,
            createdByUserId: dto.userId,
          }),
        );

        // 4. Asignación de Rol de Empresa (Contexto Patrimonial)
        await manager.save(
          manager.create(CompanyRoleEntity, {
            userId: dto.userId,
            companyId: company.id,
            role: role,
          }),
        );

        return company;
      } catch (error: unknown) {
        // 🚩 Solución error linter: Acceso seguro a .message
        const errorMessage =
          error instanceof Error ? error.message : 'Error desconocido';
        this.logger.error(`Error en transacción atómica: ${errorMessage}`);

        throw new InternalServerErrorException(
          'Fallo en la persistencia del bloque legal. Transacción revertida.',
        );
      }
    });
  }

  async createOwner(dto: CreateCompanyLegalDto): Promise<Company> {
    return this.createAtomicCompany(dto, CompanyRole.OWNER);
  }

  async createTenant(dto: CreateCompanyLegalDto): Promise<Company> {
    return this.createAtomicCompany(dto, CompanyRole.TENANT);
  }

  async createViewer(dto: CreateCompanyLegalDto): Promise<Company> {
    return this.createAtomicCompany(dto, CompanyRole.VIEWER);
  }

  /**
   * @method findAllByUser
   * @description Lista empresas según jerarquía. Usa AppRole Enum para evitar comparaciones inseguras.
   */
  async findAllByUser(userId: string, appRole: AppRole): Promise<Company[]> {
    const relations = ['fiscalEntity', 'fiscalAddress'];

    if (appRole === AppRole.SUPERADMIN) {
      return this.companyRepository.find({
        relations,
        order: { createdAt: 'DESC' },
      });
    }

    return this.companyRepository.find({
      where: { companyRoles: { userId } },
      relations,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * @method findOne
   * @description Obtiene una empresa validando el acceso del usuario.
   */
  async findOne(
    id: string,
    userId: string,
    appRole: AppRole,
  ): Promise<Company> {
    const relations = ['fiscalEntity', 'fiscalAddress'];

    // 🛡️ Blindaje de condición de búsqueda
    const whereCondition =
      appRole === AppRole.SUPERADMIN
        ? { id }
        : { id, companyRoles: { userId } };

    const company = await this.companyRepository.findOne({
      where: whereCondition,
      relations,
    });

    if (!company) {
      throw new NotFoundException(
        'Patrimonio no encontrado o acceso denegado.',
      );
    }
    return company;
  }

  async update(
    id: string,
    updateDto: UpdateCompanyDto,
    userId: string,
    appRole: AppRole,
  ): Promise<Company> {
    const company = await this.findOne(id, userId, appRole);
    const updated = Object.assign(company, updateDto);
    return this.companyRepository.save(updated);
  }

  async remove(id: string, userId: string, appRole: AppRole): Promise<void> {
    const company = await this.findOne(id, userId, appRole);
    await this.companyRepository.softRemove(company);
  }
}
