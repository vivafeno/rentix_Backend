import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

/**
 * @class TenantService
 * @description Gestión de arrendatarios con blindaje multi-tenant y soporte Veri*factu.
 * @version 2026.2.0
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
   */
  async create(companyId: string, dto: CreateTenantDto): Promise<Tenant> {
    try {
      // 🚩 Blueprint 2026: Usamos los IDs directos para evitar SELECTs previos innecesarios
      const tenant = this.tenantRepo.create({
        ...dto,
        companyId,
        fiscalIdentityId: dto.fiscalIdentityId,
        // Si el DTO incluye dirección fiscal, TypeORM la vinculará si el campo existe
      });

      const saved = await this.tenantRepo.save(tenant);
      return this.findOne(saved.id, companyId);
    } catch (error) {
      this.handleDBExceptions(error);
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
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * @method findOne
   * @description Localiza un inquilino asegurando el aislamiento por empresa.
   */
  async findOne(id: string, companyId: string): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOne({
      where: { id, companyId },
      relations: ['fiscalIdentity', 'direcciones'],
    });

    if (!tenant) {
      throw new NotFoundException(`Arrendatario con ID ${id} no localizado en esta organización.`);
    }

    return tenant;
  }

  /**
   * @method update
   * @description Actualización parcial de datos operativos o financieros.
   */
  async update(id: string, companyId: string, dto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id, companyId);
    
    // Mezclamos los datos nuevos asegurando que el companyId del JWT manda sobre cualquier intento de inyección
    const updated = this.tenantRepo.merge(tenant, dto);

    try {
      return await this.tenantRepo.save(updated);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * @method remove
   * @description Ejecuta el borrado lógico del inquilino.
   */
  async remove(id: string, companyId: string): Promise<void> {
    const tenant = await this.findOne(id, companyId);
    
    // Marcamos estado inactivo antes del soft-delete para lógica de negocio
    tenant.isActive = false;
    await this.tenantRepo.save(tenant);
    await this.tenantRepo.softRemove(tenant);
  }

  /**
   * @private
   * @description Gestor de excepciones de integridad referencial y unicidad.
   */
  private handleDBExceptions(error: any): never {
    // Error de clave única: companyId + fiscalIdentityId
    if (error.code === '23505') {
      throw new ConflictException('Esta identidad fiscal ya está registrada como inquilino en su empresa.');
    }

    console.error('Tenant Service Error:', error);
    throw new InternalServerErrorException('Error en la persistencia del arrendatario.');
  }
}