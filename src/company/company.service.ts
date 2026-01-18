import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Company } from './entities/company.entity';
import { FiscalEntity } from 'src/fiscal/entities/fiscalEntity';
import { Address } from 'src/address/entities/address.entity';
import { CreateCompanyLegalDto, UpdateCompanyDto } from './dto';
import { CompanyRoleEntity } from '../user-company-role/entities/userCompanyRole.entity'; // La clase de la Entidad
import { CompanyRole } from 'src/user-company-role/entities/userCompanyRole.entity'; // El Enum
/**
 * @description Servicio integral para la gestión de Patrimonios y Sujetos Legales.
 * Implementa persistencia atómica y aislamiento de datos (Rentix 2026).
 * @version 2026.1.17
 */
@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly dataSource: DataSource,
  ) { }

  /* ------------------------------------------------------------------
   * MÉTODOS DE CREACIÓN ATÓMICA (ORQUESTACIÓN)
   * ------------------------------------------------------------------ */

  /**
   * @description Lógica privada para la creación de infraestructura legal completa.
   */
  private async executeAtomicCreation(
    dto: CreateCompanyLegalDto,
    assignedRole: CompanyRole
  ): Promise<Company> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Crear Empresa
      const company = queryRunner.manager.create(Company, dto.company);
      const savedCompany = await queryRunner.manager.save(Company, company);

      // 2. Crear Identidad Fiscal
      const fiscal = queryRunner.manager.create(FiscalEntity, {
        ...dto.fiscal,
        companyId: savedCompany.id,
      });
      await queryRunner.manager.save(FiscalEntity, fiscal);

      // 3. Crear Dirección (Se especifica la Clase para evitar errores de tipado)
      const address = queryRunner.manager.create(Address, {
        ...dto.address,
        companyId: savedCompany.id,
        isDefault: true,
      });
      await queryRunner.manager.save(Address, address); // 👈 Corregido el paso de la Clase

      // 4. Asignar Rol Patrimonial
      const userRoleRelation = queryRunner.manager.create(CompanyRoleEntity, {
        userId: dto.userId,
        companyId: savedCompany.id,
        role: assignedRole,
      });
      await queryRunner.manager.save(CompanyRoleEntity, userRoleRelation);

      await queryRunner.commitTransaction();
      return savedCompany;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Fallo en transacción legal: ${error.message}`, error.stack);
      throw new InternalServerErrorException('No se pudo completar el alta legal del sujeto');
    } finally {
      await queryRunner.release();
    }
  }


/**
 * @description Ejecuta el alta legal atómica siguiendo el orden de dependencias.
 * 1. Address -> 2. Fiscal -> 3. Company (unificando IDs) -> 4. Role
 */
async createOwner(dto: CreateCompanyLegalDto) {
  return await this.dataSource.transaction(async (manager) => {
    
    // 1. PASO: Crear y obtener ID de la Dirección
    const address = manager.create(Address, {
      ...dto.address,
      isDefault: true,
    });
    const savedAddress = await manager.save(address);
    this.logger.log(`✅ Paso 1: Address guardada [${savedAddress.id}]`);

    // 2. PASO: Crear y obtener ID de la Entidad Fiscal
    const fiscal = manager.create(FiscalEntity, {
      ...dto.fiscal,
    });
    const savedFiscal = await manager.save(fiscal);
    this.logger.log(`✅ Paso 2: Fiscal guardada [${savedFiscal.id}]`);

    // 3. PASO: Crear la Empresa inyectando los IDs obtenidos
    // Usamos los nombres de las propiedades definidos en tu Company Entity
    const company = manager.create(Company, {
      ...(dto.company || {}),
      // Inyectamos los IDs en las columnas físicas que marcaba el error
      facturaePartyId: savedFiscal.id,
      fiscalAddressId: savedAddress.id,
      createdByUserId: dto.userId, // Auditoría
    });

    const savedCompany = await manager.save(company);
    this.logger.log(`✅ Paso 3: Company vinculada [${savedCompany.id}]`);

    // 4. PASO: Crear el Rol de OWNER
    const companyRole = manager.create(CompanyRoleEntity, {
      userId: dto.userId,
      companyId: savedCompany.id,
      role: CompanyRole.OWNER 
    });
    
    await manager.save(CompanyRoleEntity, companyRole);
    this.logger.log(`✅ Paso 4: Rol OWNER asignado a User [${dto.userId}]`);

    return savedCompany;
  });
}



  async createTenant(dto: CreateCompanyLegalDto) {
    return this.executeAtomicCreation(dto, CompanyRole.TENANT);
  }

  async createViewer(dto: CreateCompanyLegalDto) {
    return this.executeAtomicCreation(dto, CompanyRole.VIEWER);
  }

  /* ------------------------------------------------------------------
   * MÉTODOS DE CONSULTA Y GESTIÓN (TENANT ISOLATION)
   * ------------------------------------------------------------------ */

  async findAllByUser(userId: string): Promise<Company[]> {
    return this.companyRepository.find({
      // Nota: Asegúrate de que en Company.entity el @OneToMany se llame userRoles
      where: { companyRoles: { userId } },
      relations: ['fiscalEntity', 'addresses'],
    });
  }

  async findOne(id: string, userId: string): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id, companyRoles: { userId } },
      relations: ['fiscalEntity', 'addresses'],
    });

    if (!company) throw new NotFoundException('Patrimonio no encontrado o sin acceso');
    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, userId: string): Promise<Company> {
    const company = await this.findOne(id, userId);
    const updated = Object.assign(company, updateCompanyDto);
    return this.companyRepository.save(updated);
  }

  async remove(id: string, userId: string): Promise<void> {
    const company = await this.findOne(id, userId);
    await this.companyRepository.softRemove(company);
  }
}