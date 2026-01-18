import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompanyRoleEntity } from './entities/userCompanyRole.entity';
import { CreateUserCompanyRoleDto } from './dto/createUuserCompanyRole.dto';
import { UpdateUserCompanyRoleDto } from './dto/updateUserCompanyRole.dto';

/**
 * @class UserCompanyRoleService
 * @description Lógica de negocio para la gestión de autoridad y acceso (RBAC).
 * Centraliza la administración de roles en el contexto patrimonial de Rentix 2026.
 * @version 2.3.1
 * @author Rentix
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
   * Resuelve el error de linter mediante tipado del objeto de error de DB.
   * @param {CreateUserCompanyRoleDto} dto Datos del vínculo (Usuario, Empresa y Rol).
   * @returns {Promise<CompanyRoleEntity>} Vínculo creado con relaciones hidratadas.
   */
  async create(dto: CreateUserCompanyRoleDto): Promise<CompanyRoleEntity> {
    try {
      const entity = this.repo.create({
        role: dto.role,
        userId: dto.userId,
        companyId: dto.companyId,
      });

      const saved = await this.repo.save(entity);
      return this.findOne(saved.id);
    } catch (error: unknown) {
      // 🚩 Solución linter: Casting seguro de error de Postgres
      const dbError = error as { code?: string };

      if (dbError.code === '23505') {
        throw new ConflictException(
          'Seguridad: El usuario ya tiene un rol asignado en esta organización.',
        );
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
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * @method findOne
   * @description Obtiene un vínculo específico validando su existencia.
   * @param {string} id UUID del vínculo.
   */
  async findOne(id: string): Promise<CompanyRoleEntity> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['user', 'company'],
    });

    if (!entity) {
      throw new NotFoundException(
        `Vínculo de autoridad con ID ${id} no encontrado.`,
      );
    }

    return entity;
  }

  /**
   * @method update
   * @description Modifica el nivel de privilegio.
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
   * @param {string} id UUID del vínculo a eliminar.
   */
  async remove(id: string): Promise<{ message: string }> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);

    return { message: 'Vínculo de autoridad revocado correctamente.' };
  }
}
