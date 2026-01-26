import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';

import { CompanyRoleEntity } from './entities/user-company-role.entity';
import { CreateUserCompanyRoleDto } from './dto/create-user-comany-role.dto';
import { UpdateUserCompanyRoleDto } from './dto/update-user-company-role.dto';

/**
 * @class UserCompanyRoleService
 * @description Gestor de identidades y accesos Multi-tenant.
 * Garantiza que el cambio de contexto (Empresa Primaria) sea atómico.
 */
@Injectable()
export class UserCompanyRoleService {
  constructor(
    @InjectRepository(CompanyRoleEntity)
    private readonly roleRepo: Repository<CompanyRoleEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * @method create
   * @description Vinculación atómica de usuario a empresa con reset de primarios.
   */
  async create(dto: CreateUserCompanyRoleDto): Promise<CompanyRoleEntity> {
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      const { userId, companyId, isPrimary } = dto;

      const existing = await manager.findOne(CompanyRoleEntity, {
        where: { userId, companyId },
        withDeleted: true,
      });

      if (existing) {
        throw new ConflictException(
          existing.deletedAt 
            ? 'Existe un registro inactivo para este vínculo. Use el protocolo restore.' 
            : 'El usuario ya posee un rol activo en esta organización.'
        );
      }

      // Rigor: Si es primario, se ejecuta dentro de la misma transacción
      if (isPrimary) await this.setAllPrimaryFalse(userId, manager);

      const newRole = manager.create(CompanyRoleEntity, {
        ...dto,
        isActive: true
      });

      try {
        return await manager.save(newRole);
      } catch (e) {
        throw new InternalServerErrorException('Fallo en la vinculación Multi-tenant.');
      }
    });
  }

  /**
   * @method update
   * @description Actualiza el rol o la preferencia de empresa primaria de forma atómica.
   */
  async update(id: string, dto: UpdateUserCompanyRoleDto): Promise<CompanyRoleEntity> {
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      const role = await manager.findOne(CompanyRoleEntity, { where: { id } });
      if (!role) throw new NotFoundException('Vínculo de identidad no localizado.');

      if (dto.isPrimary) {
        await this.setAllPrimaryFalse(role.userId, manager);
      }

      manager.merge(CompanyRoleEntity, role, dto);
      return await manager.save(role);
    });
  }

  /**
   * @method remove
   * @description Soft Delete con blindaje operativo.
   */
  async remove(id: string): Promise<void> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Vínculo no encontrado.');

    // Ejecutamos en bloque para asegurar consistencia
    await this.roleRepo.manager.transaction(async (manager) => {
      await manager.update(CompanyRoleEntity, id, { isActive: false });
      await manager.softDelete(CompanyRoleEntity, id);
    });
  }

  /**
   * @method restore
   */
  async restore(id: string): Promise<CompanyRoleEntity> {
    const role = await this.roleRepo.findOne({ 
      where: { id }, 
      withDeleted: true 
    });

    if (!role) throw new NotFoundException('Registro no localizado en el histórico.');
    if (!role.deletedAt) return role;

    await this.roleRepo.restore(id);
    role.isActive = true;
    return await this.roleRepo.save(role);
  }

  /**
   * @method findByUser
   * @description Proporciona la lista de empresas para el selector (Select) de Angular 21.
   */
  async findByUser(userId: string): Promise<CompanyRoleEntity[]> {
    return await this.roleRepo.find({
      where: { userId, isActive: true },
      relations: ['company', 'company.fiscalIdentity'],
      order: { isPrimary: 'DESC', createdAt: 'ASC' }
    });
  }

  /* --- MÉTODOS PRIVADOS DE RIGOR --- */

  /**
   * @description Garantiza la exclusividad de la empresa primaria bajo el manager de la transacción.
   */
  private async setAllPrimaryFalse(userId: string, manager: EntityManager): Promise<void> {
    await manager.update(CompanyRoleEntity, { userId }, { isPrimary: false });
  }
}