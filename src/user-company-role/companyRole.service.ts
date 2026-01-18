import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompanyRoleEntity } from './entities/userCompanyRole.entity';
import { CreateUserCompanyRoleDto } from './dto/createUuserCompanyRole.dto';
import { UpdateUserCompanyRoleDto } from './dto/updateUserCompanyRole.dto';

/**
 * @class UserCompanyRoleService
 * @description Lógica de negocio para la gestión de autoridad y acceso (RBAC).
 * Centraliza la administración de roles en el contexto patrimonial de Rentix 2026.
 * @version 2.3.0
 */
@Injectable()
export class UserCompanyRoleService {
  constructor(
    @InjectRepository(CompanyRoleEntity)
    private readonly repo: Repository<CompanyRoleEntity>,
  ) {}

  /**
   * @method create
   * @description Registra un nuevo vínculo de autoridad. 
   * Valida la existencia del vínculo previo para evitar duplicidades mediante el índice único de la DB.
   */
  async create(dto: CreateUserCompanyRoleDto): Promise<CompanyRoleEntity> {
    try {
      // Optimizamos: Usamos los IDs directos para evitar SELECTs innecesarios de User/Company
      const entity = this.repo.create({
        role: dto.role,
        userId: dto.userId,
        companyId: dto.companyId,
      });

      const saved = await this.repo.save(entity);
      return this.findOne(saved.id); // Retornamos con relaciones para el contrato OpenAPI
    } catch (error) {
      if (error.code === '23505') { // Código estándar Postgres para Unique Violation
        throw new ConflictException('El usuario ya tiene un rol asignado en esta empresa');
      }
      throw error;
    }
  }

  /**
   * @method findAll
   * @description Recupera el histórico global de roles y sus relaciones.
   */
  async findAll(): Promise<CompanyRoleEntity[]> {
    return this.repo.find({
      relations: ['user', 'company'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * @method findOne
   * @description Obtiene un vínculo específico validando su existencia.
   */
  async findOne(id: string): Promise<CompanyRoleEntity> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['user', 'company'],
    });

    if (!entity) {
      throw new NotFoundException(`Vínculo con id ${id} no encontrado`);
    }

    return entity;
  }

  /**
   * @method update
   * @description Modifica el nivel de privilegio. El userId y companyId permanecen inmutables.
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
   * @method remove
   * @description Revoca el acceso de forma permanente.
   * @returns {Promise<{ message: string }>} Confirmación explícita para el frontend.
   */
  async remove(id: string): Promise<{ message: string }> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);

    return { message: 'Vínculo de autoridad eliminado correctamente' };
  }
}