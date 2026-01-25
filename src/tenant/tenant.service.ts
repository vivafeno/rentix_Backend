import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { AppRole } from 'src/auth/enums/user-global-role.enum';

/**
 * @class TenantService
 * @description Gestión de arrendatarios con blindaje multi-tenant y soporte Veri*factu.
 * Implementa lógica de persistencia para el CRM de Rentix 2026.
 */
@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

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
      const tenant = this.tenantRepo.create({
        ...dto,
        companyId,
      });

      const saved = await this.tenantRepo.save(tenant);
      // Retornamos con relaciones cargadas para el frontend
      return await this.findOne(saved.id, companyId, AppRole.USER);
    } catch (error: unknown) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * @method findAll
   * @description Recupera inquilinos filtrados por empresa y estado operativo.
   */
  async findAll(companyId: string, appRole: AppRole = AppRole.USER): Promise<Tenant[]> {
    const isSA = appRole === AppRole.SUPERADMIN;

    return await this.tenantRepo.find({
      where: { 
        companyId,
        ...(isSA ? {} : { isActive: true }) // El usuario normal solo ve activos
      },
      relations: ['fiscalIdentity', 'addresses'],
      withDeleted: isSA,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * @method findOne
   * @description Localiza un inquilino asegurando el aislamiento por empresa.
   */
  async findOne(id: string, companyId: string, appRole: AppRole = AppRole.USER): Promise<Tenant> {
    const isSA = appRole === AppRole.SUPERADMIN;

    const tenant = await this.tenantRepo.findOne({
      where: { id, companyId },
      relations: ['fiscalIdentity', 'addresses'],
      withDeleted: isSA,
    });

    if (!tenant) {
      throw new NotFoundException(
        `Arrendatario [${id}] no localizado en esta organización.`,
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
    appRole: AppRole = AppRole.USER
  ): Promise<Tenant> {
    const tenant = await this.findOne(id, companyId, appRole);
    
    // Evitamos edición de inactivos a menos que seas SA
    if (!tenant.isActive && appRole !== AppRole.SUPERADMIN) {
      throw new ConflictException('No se pueden editar datos de un inquilino inactivo.');
    }

    const updated = this.tenantRepo.merge(tenant, dto);

    try {
      return await this.tenantRepo.save(updated);
    } catch (error: unknown) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * @method toggleStatus
   * @description Alterna el estado operativo (Activar/Desactivar).
   * Sincroniza isActive con deletedAt para coherencia con BaseEntity.
   */
  async toggleStatus(id: string, companyId: string, activate: boolean): Promise<Tenant> {
    const tenant = await this.findOne(id, companyId, AppRole.SUPERADMIN);

    tenant.isActive = activate;
    tenant.deletedAt = activate ? null : new Date();

    return await this.tenantRepo.save(tenant);
  }

  /**
   * @private
   * @method handleDBExceptions
   */
  private handleDBExceptions(error: unknown): never {
    const dbError = error as { code?: string; detail?: string };

    if (dbError.code === '23505') {
      throw new ConflictException(
        'Esta identidad fiscal ya está registrada como inquilino en su empresa.',
      );
    }

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Error en la persistencia del arrendatario.',
    );
  }
}