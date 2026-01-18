import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

/**
 * @class TenantService
 * @description Gestión de arrendatarios con blindaje multi-tenant y soporte Veri*factu.
 * Implementa lógica de persistencia para el CRM de Rentix.
 * @version 2026.2.1
 * @author Rentix
 */
@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
  ) {}

  /**
   * @method create
   * @description Registra un inquilino vinculándolo a una identidad fiscal y empresa.
   * @param {string} companyId Contexto del patrimonio.
   * @param {CreateTenantDto} dto Datos del inquilino.
   * @returns {Promise<Tenant>} Entidad persistida e hidratada.
   */
  async create(companyId: string, dto: CreateTenantDto): Promise<Tenant> {
    try {
      const tenant = this.tenantRepo.create({
        ...dto,
        companyId,
        fiscalIdentityId: dto.fiscalIdentityId,
      });

      const saved = await this.tenantRepo.save(tenant);
      return await this.findOne(saved.id, companyId);
    } catch (error: unknown) {
      return this.handleDBExceptions(error);
    }
  }

  /**
   * @method findAll
   * @description Recupera inquilinos operativos del patrimonio actual.
   */
  async findAll(companyId: string): Promise<Tenant[]> {
    return await this.tenantRepo.find({
      where: { companyId },
      relations: ['fiscalIdentity', 'direcciones'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * @method findOne
   * @description Localiza un inquilino asegurando el aislamiento por empresa.
   * @throws {NotFoundException} Si el inquilino no existe en la organización.
   */
  async findOne(id: string, companyId: string): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOne({
      where: { id, companyId },
      relations: ['fiscalIdentity', 'direcciones'],
    });

    if (!tenant) {
      throw new NotFoundException(
        `Arrendatario con ID ${id} no localizado en esta organización.`,
      );
    }

    return tenant;
  }

  /**
   * @method update
   * @description Actualización parcial de datos operativos o financieros.
   */
  async update(
    id: string,
    companyId: string,
    dto: UpdateTenantDto,
  ): Promise<Tenant> {
    const tenant = await this.findOne(id, companyId);
    const updated = this.tenantRepo.merge(tenant, dto);

    try {
      return await this.tenantRepo.save(updated);
    } catch (error: unknown) {
      return this.handleDBExceptions(error);
    }
  }

  /**
   * @method remove
   * @description Ejecuta el borrado lógico del inquilino.
   */
  async remove(id: string, companyId: string): Promise<void> {
    const tenant = await this.findOne(id, companyId);

    tenant.isActive = false;
    await this.tenantRepo.save(tenant);
    await this.tenantRepo.softRemove(tenant);
  }

  /**
   * @private
   * @method handleDBExceptions
   * @description Gestor de excepciones de integridad referencial con tipado seguro.
   * Resuelve error de linter 117 eliminando el acceso a 'any'.
   */
  private handleDBExceptions(error: unknown): never {
    const dbError = error as { code?: string };

    if (dbError.code === '23505') {
      throw new ConflictException(
        'Esta identidad fiscal ya está registrada como inquilino en su empresa.',
      );
    }

    throw new InternalServerErrorException(
      'Error en la persistencia del arrendatario.',
    );
  }
}
