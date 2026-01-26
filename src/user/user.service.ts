import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  InternalServerErrorException, 
  Logger 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';

import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserDto } from './dto';

/**
 * @class UserService
 * @description Motor de gestión de identidades y perfiles de Rentix.
 * * Implementa el estándar de seguridad 2026:
 * 1. **Certeza de Tipado**: Resolución de conflictos entre TypeORM y Class-Transformer.
 * 2. **Serialización Blindada**: Uso de UserDto para evitar fugas de hashes de seguridad.
 * 3. **Hidratación Profunda**: Carga de contextos patrimoniales para Angular Signals.
 */
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /* ------------------------------------------------------------------
   * 👤 PERFIL Y CONTEXTO (Me)
   * ------------------------------------------------------------------ */

  /**
   * Obtiene el perfil privado del usuario con su jerarquía de empresas.
   * @param userId UUID del usuario autenticado.
   * @returns DTO serializado con exclusión de campos sensibles.
   */
  async findMe(userId: string): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
      relations: [
        'companyRoles',
        'companyRoles.company',
        'companyRoles.company.fiscalIdentity',
      ],
    });

    if (!user) throw new NotFoundException('Perfil de usuario no localizado.');
    
    // Forzamos el cast a UserDto para evitar el error TS2740
    return plainToInstance(UserDto, user, { 
      excludeExtraneousValues: true 
    }) as UserDto;
  }

  /* ------------------------------------------------------------------
   * 🏗️ GESTIÓN DE CICLO DE VIDA (CRUD)
   * ------------------------------------------------------------------ */

  /**
   * Registra un nuevo usuario aplicando hashing y normalización de términos.
   * @param dto Datos de creación validados.
   */
  async create(dto: CreateUserDto): Promise<UserDto> {
    const { password, email, acceptTerms, ...userData } = dto;

    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) throw new ConflictException(`La identidad ${email} ya existe.`);

    // SOLUCIÓN DeepPartial: Usamos undefined en lugar de null para el tipo Date
    const user = this.userRepository.create({
      ...userData,
      email,
      password: await bcrypt.hash(password, 10),
      isActive: true,
      acceptedTermsAt: acceptTerms ? new Date() : undefined,
    });

    try {
      const saved = await this.userRepository.save(user);
      return plainToInstance(UserDto, saved, { 
        excludeExtraneousValues: true 
      }) as UserDto;
    } catch (error: any) {
      this.logger.error(`[UserService] Error atómico en creación: ${error.message}`);
      throw new InternalServerErrorException('No se pudo procesar el registro.');
    }
  }

  /**
   * Lista todos los usuarios operativos.
   */
  async findAll(): Promise<UserDto[]> {
    const users = await this.userRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' }
    });
    return plainToInstance(UserDto, users, { 
      excludeExtraneousValues: true 
    }) as UserDto[];
  }

  /**
   * Busca un usuario por ID cargando sus roles empresariales.
   */
  async findOne(id: string): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['companyRoles', 'companyRoles.company'],
    });

    if (!user) throw new NotFoundException(`Usuario [${id}] no encontrado.`);
    return plainToInstance(UserDto, user, { 
      excludeExtraneousValues: true 
    }) as UserDto;
  }

  /**
   * Actualiza el perfil de forma parcial.
   */
  async update(id: string, dto: UpdateUserDto): Promise<UserDto> {
    const user = await this.userRepository.preload({ id, ...dto });
    if (!user) throw new NotFoundException('Imposible actualizar: Usuario inexistente.');

    const updated = await this.userRepository.save(user);
    return plainToInstance(UserDto, updated, { 
      excludeExtraneousValues: true 
    }) as UserDto;
  }

  /**
   * Borrado lógico (Soft Delete) y desactivación.
   */
  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no localizado.');

    await this.userRepository.update(id, { isActive: false });
    await this.userRepository.softDelete(id);
  }

  /* ------------------------------------------------------------------
   * 🔐 HELPERS PARA AUTENTICACIÓN (USO INTERNO)
   * ------------------------------------------------------------------ */

  /**
   * @internal Uso exclusivo para AuthStrategy.
   */
  async findByEmailForAuth(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .leftJoinAndSelect('user.companyRoles', 'companyRoles')
      .where('user.email = :email', { email })
      .andWhere('user.isActive = :active', { active: true })
      .getOne();
  }

  /**
   * @internal Uso exclusivo para Refresh Token.
   */
  async findByIdForAuth(id: string): Promise<User | null> {
    return await this.userRepository.createQueryBuilder('user')
      .addSelect('user.refreshTokenHash') 
      .leftJoinAndSelect('user.companyRoles', 'companyRoles') 
      .where('user.id = :id', { id })
      .andWhere('user.isActive = :active', { active: true })
      .getOne();
  }

  async updateRefreshToken(id: string, hash: string | null): Promise<void> {
    await this.userRepository.update(id, { refreshTokenHash: hash });
  }
}