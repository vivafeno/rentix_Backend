import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompanyRoleEntity } from './entities/userCompanyRole.entity';
import { CreateUserCompanyRoleDto, UpdateUserCompanyRoleDto } from './dto';
import { User } from 'src/user/entities/user.entity';
import { Company } from 'src/company/entities/company.entity';

@Injectable()
export class UserCompanyRoleService {
  constructor(
    @InjectRepository(CompanyRoleEntity)
    private readonly repo: Repository<CompanyRoleEntity>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  /**
   * Crear vínculo usuario ↔ empresa con rol
   *
   * Devuelve la entidad completa con relaciones
   * para coherencia con Swagger / OpenAPI
   */
  async create(
    dto: CreateUserCompanyRoleDto,
  ): Promise<CompanyRoleEntity> {
    const user = await this.userRepo.findOne({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `Usuario con id ${dto.userId} no encontrado`,
      );
    }

    const company = await this.companyRepo.findOne({
      where: { id: dto.companyId },
    });

    if (!company) {
      throw new NotFoundException(
        `Empresa con id ${dto.companyId} no encontrada`,
      );
    }

    const entity = this.repo.create({
      role: dto.role,
      user,
      company,
    });

    return this.repo.save(entity);
  }

  /**
   * Listar todos los vínculos usuario-empresa
   */
  async findAll(): Promise<CompanyRoleEntity[]> {
    return this.repo.find({
      relations: ['user', 'company'],
    });
  }

  /**
   * Obtener vínculo usuario-empresa por ID
   */
  async findOne(id: string): Promise<CompanyRoleEntity> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['user', 'company'],
    });

    if (!entity) {
      throw new NotFoundException(
        `Vínculo usuario-empresa con id ${id} no encontrado`,
      );
    }

    return entity;
  }

  /**
   * Actualizar vínculo usuario-empresa
   *
   * Solo permite modificar el rol
   */
  async update(
    id: string,
    dto: UpdateUserCompanyRoleDto,
  ): Promise<CompanyRoleEntity> {
    const entity = await this.findOne(id);

    if (dto.role) {
      entity.role = dto.role;
    }

    return this.repo.save(entity);
  }

  /**
   * Eliminar vínculo usuario-empresa
   *
   * ⚠️ Devuelve objeto explícito para:
   * - Swagger
   * - OpenAPI
   * - api-types.ts en frontend
   */
  async remove(id: string): Promise<{ message: string }> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);

    return { message: 'Vínculo eliminado correctamente' };
  }
}
