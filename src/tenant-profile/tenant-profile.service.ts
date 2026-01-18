import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TenantProfile } from './entities/tenant-profile.entity';
import { CreateTenantProfileDto } from './dto/create-tenant-profile.dto';
import { UpdateTenantProfileDto } from './dto/update-tenant-profile.dto';

/**
 * @class TenantProfileService
 * @description Gestión de perfiles de cliente (CRM) con aislamiento por empresa.
 * Implementa la lógica de negocio para la hidratación de perfiles legales.
 * @version 2026.1.19
 * @author Rentix
 */
@Injectable()
export class TenantProfileService {
  constructor(
    @InjectRepository(TenantProfile)
    private readonly profileRepo: Repository<TenantProfile>,
  ) {}

  /**
   * @method create
   * @description Registra un nuevo perfil de cliente.
   * Resuelve errores 36, 46 y 48 del linter mediante tipado seguro de excepciones.
   */
  async create(
    companyId: string,
    dto: CreateTenantProfileDto,
  ): Promise<TenantProfile> {
    const profile = this.profileRepo.create({
      ...dto,
      companyId,
    });

    try {
      return await this.profileRepo.save(profile);
    } catch (error: unknown) {
      // 🛡️ Solución linter: Casting seguro para evitar 'unsafe member access'
      const dbError = error as { code?: string; detail?: string };

      if (dbError.code === '23505') {
        throw new ConflictException(
          `Conflicto de duplicidad: El registro ya existe. ${dbError.detail || ''}`,
        );
      }

      throw new InternalServerErrorException(
        'Error de infraestructura al crear el perfil de cliente.',
      );
    }
  }

  /**
   * @method findAll
   * @description Lista perfiles operativos de una empresa específica.
   */
  async findAll(companyId: string): Promise<TenantProfile[]> {
    return await this.profileRepo.find({
      where: { companyId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * @method findOne
   * @description Recupera un perfil validando el contexto de la empresa.
   */
  async findOne(id: string, companyId: string): Promise<TenantProfile> {
    const profile = await this.profileRepo.findOne({
      where: { id, companyId, isActive: true },
    });

    if (!profile) {
      throw new NotFoundException(`Perfil de cliente ${id} no encontrado.`);
    }

    return profile;
  }

  /**
   * @method update
   * @description Actualización parcial de datos del perfil.
   */
  async update(
    id: string,
    companyId: string,
    dto: UpdateTenantProfileDto,
  ): Promise<TenantProfile> {
    const profile = await this.findOne(id, companyId);

    const updatedProfile = this.profileRepo.merge(profile, dto);
    return await this.profileRepo.save(updatedProfile);
  }

  /**
   * @method remove
   * @description Borrado lógico (Soft delete) del perfil.
   */
  async remove(id: string, companyId: string): Promise<TenantProfile> {
    const profile = await this.findOne(id, companyId);

    profile.isActive = false;
    profile.deletedAt = new Date();

    return await this.profileRepo.save(profile);
  }

  /**
   * @method generateInternalCode
   * @description Genera un código secuencial para uso administrativo.
   * Resuelve error 135: Eliminado async si no hay operaciones de base de datos asíncronas aún.
   */
  generateInternalCode(prefix: string): string {
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix.toUpperCase()}-${timestamp}`;
  }
}
