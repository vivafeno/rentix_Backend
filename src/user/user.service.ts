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
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';

/**
 * @class UserService
 * @description Gestión de identidades y perfiles de usuario bajo estándar Rentix 2026.
 * Implementa SoftDelete, Hashing de seguridad y Contexto Patrimonial (findMe).
 */
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /* ------------------------------------------------------------------
   * 👤 CONTEXTO DE USUARIO (Me)
   * ------------------------------------------------------------------ */

  /**
   * @method findMe
   * @description Recupera el perfil completo incluyendo relaciones patrimoniales para el Front.
   */
  async findMe(userId: string): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
      relations: [
        'companyRoles',
        'companyRoles.company',
        'companyRoles.company.fiscalIdentity', // Rigor: Trazabilidad fiscal completa
      ],
    });

    if (!user) throw new NotFoundException('Perfil de usuario no localizado.');
    
    return plainToInstance(UserDto, user);
  }

  /* ------------------------------------------------------------------
   * 🏗️ GESTIÓN DE CICLO DE VIDA (CRUD)
   * ------------------------------------------------------------------ */

  async create(dto: CreateUserDto): Promise<UserDto> {
    const { password, email, acceptTerms, ...userData } = dto;

    // 1. Verificación de identidad única
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) throw new ConflictException(`Identidad ${email} ya registrada.`);

    // 2. Hidratación Rentix 2026
    const user = new User();
    Object.assign(user, userData);
    
    user.email = email;
    user.password = await bcrypt.hash(password, 10);
    user.isActive = true;
    
    if (acceptTerms) {
      user.acceptedTermsAt = new Date();
    }

    try {
      const saved = await this.userRepository.save(user);
      return plainToInstance(UserDto, saved);
    } catch (error) {
      this.logger.error(`Error creando usuario: ${error.message}`);
      throw new InternalServerErrorException('Error atómico en la creación del usuario.');
    }
  }

  async findAll(): Promise<UserDto[]> {
    const users = await this.userRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' }
    });
    return plainToInstance(UserDto, users);
  }

  async findOne(id: string): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['companyRoles', 'companyRoles.company'],
    });

    if (!user) throw new NotFoundException(`Usuario con UUID ${id} no encontrado.`);
    return plainToInstance(UserDto, user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDto> {
    // 🚩 Rigor: Preload asegura que la entidad exista antes de intentar el merge
    const user = await this.userRepository.preload({ id, ...dto });
    if (!user) throw new NotFoundException(`Imposible actualizar: Usuario ${id} inexistente.`);

    const updated = await this.userRepository.save(user);
    return plainToInstance(UserDto, updated);
  }

  /**
   * @method remove
   * @description Implementación SoftDelete Rentix. Bloqueo operativo + Borrado lógico.
   */
  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado.`);

    // Bloqueo preventivo y borrado de TypeORM (deletedAt)
    await this.userRepository.update(id, { isActive: false });
    await this.userRepository.softDelete(id);
  }

  /* ------------------------------------------------------------------
   * 🔐 HELPERS PARA AUTENTICACIÓN
   * ------------------------------------------------------------------ */

  async findByEmailForAuth(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password') // Necesario por select: false en entity
      .where('user.email = :email', { email })
      .andWhere('user.isActive = :active', { active: true })
      .getOne();
  }

  async updateRefreshToken(id: string, hash: string | null): Promise<void> {
    await this.userRepository.update(id, { refreshTokenHash: hash });
  }

  /**
 * @method findByIdForAuth
 * @description Uso exclusivo para Auth: Recupera el usuario con el hash del refresh token.
 */
async findByIdForAuth(id: string): Promise<User | null> {
  return await this.userRepository.createQueryBuilder('user')
    .addSelect('user.refreshTokenHash') // Recuperamos el campo oculto
    .leftJoinAndSelect('user.companyRoles', 'companyRoles') // Cargamos roles para el contexto
    .where('user.id = :id', { id })
    .andWhere('user.isActive = :active', { active: true })
    .getOne();
}
}