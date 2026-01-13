import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { MeDto } from './dto/me.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /* ------------------------------------------------------------------
   * MAPPERS (Privados)
   * ------------------------------------------------------------------ */

  private toDto(user: User): UserDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName, 
      lastName: user.lastName,
      appRole: user.appRole,     
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /* ------------------------------------------------------------------
   * CRUD
   * ------------------------------------------------------------------ */

  async create(dto: CreateUserDto): Promise<UserDto> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });
    const saved = await this.userRepository.save(user);
    return this.toDto(saved);
  }

  async findAll(): Promise<UserDto[]> {
    const users = await this.userRepository.find({
      where: { isActive: true },
    });
    return users.map((u) => this.toDto(u));
  }

  async findOne(id: string): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true },
      relations: ['companyRoles', 'companyRoles.company'],
    });

    if (!user) throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    return this.toDto(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDto> {
    const user = await this.userRepository.findOne({ where: { id, isActive: true } });
    if (!user) throw new NotFoundException(`Usuario con id ${id} no encontrado`);

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(user, dto);
    const updated = await this.userRepository.save(user);
    return this.toDto(updated);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    
    user.isActive = false;
    await this.userRepository.save(user);
  }

  /* ------------------------------------------------------------------
   * AUTH HELPERS (Uso de QueryBuilder para campos ocultos)
   * ------------------------------------------------------------------ */

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.createQueryBuilder('user')
      .addSelect('user.refreshTokenHash')
      .where('user.id = :id', { id })
      .getOne();
  }

  async updateRefreshToken(id: string, hash: string | null): Promise<void> {
    await this.userRepository.update(id, { refreshTokenHash: hash });
  }

  /* ------------------------------------------------------------------
   * GET ME (Perfil completo para el Front)
   * ------------------------------------------------------------------ */

  async findMe(userId: string): Promise<MeDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
      relations: [
        'companyRoles',
        'companyRoles.company',
        'companyRoles.company.facturaeParty',
      ],
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      appRole: user.appRole, 
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      
      // 👇 MAPEO CORREGIDO CON FACTURAE NAME
      companyRoles: user.companyRoles?.map((cr) => ({
        companyId: cr.company.id,
        // Usamos el getter inteligente que calcula si es Razón Social o Nombre Legal
        companyName: cr.company.facturaeParty?.facturaeName || 'Empresa sin nombre', 
        role: cr.role,
      })) || [],
    };
  }
}