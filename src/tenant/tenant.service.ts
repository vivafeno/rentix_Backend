import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { AppRole } from 'src/auth/enums/user-global-role.enum';
import { CompanyRole } from 'src/user-company-role/enums/user-company-role.enum';

/**
 * @class TenantService
 * @description Gestión de arrendatarios con blindaje multi-tenant.
 * Alineado para consumo de Signals en Angular 21.
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
   * @description Alta atómica de inquilino.
   */
  async create(
    companyId: string, 
    dto: CreateTenantDto, 
    companyRole: CompanyRole
  ): Promise<Tenant> {
    this.checkWriteAccess(companyRole);

    const tenant = this.tenantRepo.create({
      ...dto,
      companyId,
      isActive: true,
    });

    try {
      // Rigor: Guardamos y retornamos el objeto. 
      // Las relaciones se cargarán mediante eager loading en la entidad o findOne posterior si es necesario.
      return await this.tenantRepo.save(tenant);
    } catch (error: unknown) {
      throw this.handleDBExceptions(error);
    }
  }

  /**
   * @method findAll
   * @description Los Signals del Front recibirán la lista filtrada por contexto empresarial.
   */
  async findAll(companyId: string, appRole: AppRole = AppRole.USER): Promise<Tenant[]> {
    const isSA = appRole === AppRole.SUPERADMIN;

    return await this.tenantRepo.find({
      where: { 
        companyId,
        ...(isSA ? {} : { isActive: true }) 
      },
      relations: ['fiscalIdentity', 'addresses'],
      withDeleted: isSA,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * @method findOne
   */
  async findOne(id: string, companyId: string, appRole: AppRole = AppRole.USER): Promise<Tenant> {
    const isSA = appRole === AppRole.SUPERADMIN;

    const tenant = await this.tenantRepo.findOne({
      where: { id, companyId },
      relations: ['fiscalIdentity', 'addresses'],
      withDeleted: isSA,
    });

    if (!tenant) {
      throw new NotFoundException(`Arrendatario [${id}] no localizado en su empresa.`);
    }

    return tenant;
  }

  /**
   * @method update
   */
  async update(
    id: string,
    companyId: string,
    dto: UpdateTenantDto,
    companyRole: CompanyRole,
    appRole: AppRole = AppRole.USER,
  ): Promise<Tenant> {
    this.checkWriteAccess(companyRole);
    const tenant = await this.findOne(id, companyId, appRole);
    
    if (!tenant.isActive && appRole !== AppRole.SUPERADMIN) {
      throw new ConflictException('No se permite editar inquilinos inactivos.');
    }

    const updated = this.tenantRepo.merge(tenant, dto);

    try {
      return await this.tenantRepo.save(updated);
    } catch (error: unknown) {
      throw this.handleDBExceptions(error);
    }
  }

  /**
   * @method toggleStatus
   * @description Sincroniza el estado operativo con el borrado lógico.
   */
  async toggleStatus(
    id: string, 
    companyId: string, 
    activate: boolean, 
    companyRole: CompanyRole
  ): Promise<Tenant> {
    if (companyRole !== CompanyRole.OWNER) {
      throw new ForbiddenException('Solo el propietario de la empresa puede dar de baja inquilinos.');
    }

    const tenant = await this.findOne(id, companyId, AppRole.SUPERADMIN);

    tenant.isActive = activate;
    tenant.deletedAt = activate ? null : new Date();

    return await this.tenantRepo.save(tenant);
  }

  /* --- MÉTODOS PRIVADOS DE RIGOR --- */

  private checkWriteAccess(role: CompanyRole): void {
    if (role !== CompanyRole.OWNER) {
      throw new ForbiddenException('Operación restringida: Se requieren permisos de propietario.');
    }
  }

  private handleDBExceptions(error: unknown): never {
    const dbError = error as { code?: string; detail?: string };

    if (dbError.code === '23505') {
      throw new ConflictException('La identidad fiscal (NIF/CIF) ya está registrada en esta empresa.');
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Fallo crítico en la persistencia del inquilino.');
  }
}