import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { CompanyRoleEntity } from './entities/user-company-role.entity';
import { CreateUserCompanyRoleDto } from './dto/create-user-comany-role.dto';
import { UpdateUserCompanyRoleDto } from './dto/update-user-company-role.dto';

@Injectable()
export class UserCompanyRoleService {
  constructor(
    @InjectRepository(CompanyRoleEntity)
    private readonly roleRepo: Repository<CompanyRoleEntity>,
  ) {}

  /**
   * @method create
   * @description Vincula un usuario a una empresa. Valida duplicados incluso en registros borrados.
   */
  async create(dto: CreateUserCompanyRoleDto): Promise<CompanyRoleEntity> {
    const { userId, companyId, isPrimary } = dto;

    // 1. Verificar si ya existe (incluyendo los borrados mediante soft delete)
    const existing = await this.roleRepo.findOne({
      where: { userId, companyId },
      withDeleted: true,
    });

    if (existing) {
      if (!existing.deletedAt) {
        throw new ConflictException('El usuario ya tiene un rol activo en esta empresa.');
      }
      throw new ConflictException('Existe un registro borrado para este vínculo. Use el método "restore".');
    }

    // 2. Si se marca como primario, resetear los otros roles del usuario
    if (isPrimary) await this.setAllPrimaryFalse(userId);

    const newRole = this.roleRepo.create(dto);
    return await this.roleRepo.save(newRole);
  }

  /**
   * @method remove
   * @description Soft Delete Rentix 2026: isActive a false y llenado de deletedAt.
   */
  async remove(id: string): Promise<void> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Vínculo de rol no encontrado.');

    // Bloqueo operativo + Borrado lógico de TypeORM
    await this.roleRepo.update(id, { isActive: false });
    await this.roleRepo.softDelete(id);
  }

  /**
   * @method restore
   * @description Reactiva un rol previamente borrado.
   */
  async restore(id: string): Promise<CompanyRoleEntity> {
    const role = await this.roleRepo.findOne({ 
      where: { id }, 
      withDeleted: true 
    });

    if (!role) throw new NotFoundException('No se encontró el registro para restaurar.');
    if (!role.deletedAt) return role; // Ya está activo

    // 1. Restaurar en TypeORM (limpia deletedAt)
    await this.roleRepo.restore(id);
    
    // 2. Reactivación operativa
    role.isActive = true;
    return await this.roleRepo.save(role);
  }

  /**
   * @method update
   * @description Actualiza el rol o la preferencia de empresa primaria.
   */
  async update(id: string, dto: UpdateUserCompanyRoleDto): Promise<CompanyRoleEntity> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Vínculo no encontrado.');

    if (dto.isPrimary) {
      await this.setAllPrimaryFalse(role.userId);
    }

    Object.assign(role, dto);
    return await this.roleRepo.save(role);
  }

  /* --- MÉTODOS PRIVADOS DE RIGOR --- */

  /**
   * @description Asegura que solo una empresa sea la 'Primaria' para el Dashboard del usuario.
   */
  private async setAllPrimaryFalse(userId: string): Promise<void> {
    await this.roleRepo.update({ userId }, { isPrimary: false });
  }

  async findByUser(userId: string): Promise<CompanyRoleEntity[]> {
    return await this.roleRepo.find({
      where: { userId, isActive: true },
      relations: ['company', 'company.fiscalIdentity'],
    });
  }
}