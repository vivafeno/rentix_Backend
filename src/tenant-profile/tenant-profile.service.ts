import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TenantProfile } from './entities/tenant-profile.entity';
import { CreateTenantProfileDto } from './dto/create-tenant-profile.dto';
import { UpdateTenantProfileDto } from './dto/update-tenant-profile.dto';

/**
 * @class TenantProfileService
 * @description Gestión de perfiles legales y fiscales de clientes (CRM).
 * Implementa el estándar Rentix 2026 para el aislamiento Multi-tenant.
 * Este servicio garantiza que cada factura tenga un receptor legalmente válido.
 * @version 2.2.0
 */
@Injectable()
export class TenantProfileService {
  private readonly logger = new Logger(TenantProfileService.name);

  constructor(
    @InjectRepository(TenantProfile)
    private readonly profileRepo: Repository<TenantProfile>,
  ) {}

  /**
   * Registra un nuevo perfil de cliente en el contexto de la empresa activa.
   * @param companyId UUID de la empresa emisora.
   * @param dto Datos del perfil (Identidad fiscal, dirección, contacto).
   * @throws {ConflictException} Si el CIF/NIF ya existe en la empresa.
   * @returns El perfil persistido.
   */
  async create(
    companyId: string,
    dto: CreateTenantProfileDto,
  ): Promise<TenantProfile> {
    const profile = this.profileRepo.create({
      ...dto,
      companyId,
      isActive: true,
    });

    try {
      return await this.profileRepo.save(profile);
    } catch (error: unknown) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Lista todos los perfiles operativos de la empresa.
   * @param companyId Contexto patrimonial activo.
   */
  async findAll(companyId: string): Promise<TenantProfile[]> {
    return await this.profileRepo.find({
      where: { companyId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Localiza un perfil específico validando la propiedad de la empresa.
   * @param id UUID del perfil.
   * @param companyId Contexto de seguridad Multi-tenant.
   */
  async findOne(id: string, companyId: string): Promise<TenantProfile> {
    const profile = await this.profileRepo.findOne({
      where: { id, companyId, isActive: true },
    });

    if (!profile) {
      throw new NotFoundException(`Perfil de cliente [${id}] no localizado.`);
    }

    return profile;
  }

  /**
   * Actualización parcial del perfil fiscal.
   */
  async update(
    id: string,
    companyId: string,
    dto: UpdateTenantProfileDto,
  ): Promise<TenantProfile> {
    const profile = await this.findOne(id, companyId);
    
    // Mezcla de datos atómica conservando el ID y companyId original
    const updatedProfile = this.profileRepo.merge(profile, dto);
    
    try {
      return await this.profileRepo.save(updatedProfile);
    } catch (error: unknown) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Borrado lógico (Soft Delete) del perfil.
   * El registro se marca como inactivo para preservar la integridad histórica de las facturas.
   */
  async remove(id: string, companyId: string): Promise<TenantProfile> {
    const profile = await this.findOne(id, companyId);

    profile.isActive = false;
    profile.deletedAt = new Date();

    return await this.profileRepo.save(profile);
  }

  /**
   * Genera un código de referencia interno para el CRM.
   * @param prefix Prefijo administrativo (ej: 'CL').
   */
  generateInternalCode(prefix: string): string {
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix.toUpperCase()}-${timestamp}`;
  }

  /**
   * Procesador centralizado de excepciones de base de datos.
   * @private
   */
  private handleDBExceptions(error: unknown): never {
    const dbError = error as { code?: string; detail?: string };

    if (dbError.code === '23505') {
      throw new ConflictException(
        `Restricción de duplicidad: Ya existe un registro con estos datos fiscales.`,
      );
    }

    this.logger.error(`[TenantProfileService] Error crítico: ${dbError.detail || 'Error desconocido'}`);
    throw new InternalServerErrorException(
      'Fallo de infraestructura en el módulo CRM de clientes.',
    );
  }
}