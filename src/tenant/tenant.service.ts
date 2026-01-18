import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

/**
 * Servicio para la gestión de Arrendatarios (Tenants).
 * Implementa lógica de aislamiento por empresa y cumplimiento de Facturae.
 * * @author Gemini Blueprint 2026
 */
@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  /**
   * Crea un arrendatario asegurando que no esté duplicado en la misma empresa.
   * Vincula la identidad fiscal pre-existente.
   */
  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const { fiscalIdentityId, companyId } = createTenantDto;

    const existing = await this.tenantRepository.findOne({
      where: { fiscalIdentityId, companyId }
    });

    if (existing) {
      throw new ConflictException('Este arrendatario ya existe en esta empresa.');
    }

    // Mapeo explícito para asegurar que TypeORM reconoce la relación por ID
    const tenant = this.tenantRepository.create({
      ...createTenantDto,
      fiscalIdentity: { id: fiscalIdentityId }
    });
    
    return await this.tenantRepository.save(tenant);
  }

  /**
   * Lista arrendatarios filtrando por empresa (Aislamiento Multi-tenant).
   */
  async findAll(companyId: string): Promise<Tenant[]> {
    return await this.tenantRepository.find({
      where: { companyId },
      relations: ['fiscalIdentity', 'addresses'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Obtiene un detalle asegurando que pertenece a la empresa solicitante.
   */
  async findOne(id: string, companyId?: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { 
        id, 
        ...(companyId && { companyId }) 
      },
      relations: ['fiscalIdentity', 'addresses'],
    });

    if (!tenant) {
      throw new NotFoundException(`Arrendatario no encontrado en esta empresa`);
    }

    return tenant;
  }

  /**
   * Actualización segura con validación de pertenencia.
   */
  async update(id: string, updateTenantDto: UpdateTenantDto, companyId: string): Promise<Tenant> {
    const tenant = await this.findOne(id, companyId);
    
    const updatedTenant = this.tenantRepository.merge(tenant, {
      ...updateTenantDto,
      ...(updateTenantDto.fiscalIdentityId && { fiscalIdentity: { id: updateTenantDto.fiscalIdentityId } })
    });

    return await this.tenantRepository.save(updatedTenant);
  }

  /**
   * Borrado lógico (Soft Delete) sincronizado con flag isActive.
   */
  async remove(id: string, companyId: string): Promise<void> {
    const tenant = await this.findOne(id, companyId);
    
    // Marcamos como inactivo para lógica de negocio y aplicamos borrado de TypeORM
    tenant.isActive = false;
    await this.tenantRepository.save(tenant);
    await this.tenantRepository.softRemove(tenant);
  }
}