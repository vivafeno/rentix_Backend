import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { MeDto } from './dto/me.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  /** 🔹 Mapper para ocultar password y refreshTokenHash */
  private toDto(user: User): UserDto {
    const { id, email, userGlobalRole, isActive, createdAt, updatedAt } = user;
    return { id, email, userGlobalRole, isActive, createdAt, updatedAt };
  }

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const saved = await this.userRepository.save(user);
    return this.toDto(saved);
  }

  async findAll(): Promise<UserDto[]> {
    const users = await this.userRepository.find({
      where: { isActive: true },
      relations: ['companyRoles',],
    });
    return users.map((u) => this.toDto(u));
  }

  async findOne(id: string): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true },
      relations: ['companyRoles', 'clientProfiles'],
    });
    if (!user) throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    return this.toDto(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true },
    });
    if (!user) throw new NotFoundException(`Usuario con id ${id} no encontrado`);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    const updated = await this.userRepository.save(user);
    return this.toDto(updated);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    user.isActive = false;
    await this.userRepository.save(user);
  }

  /** 🔹 Métodos auxiliares usados en Auth */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateRefreshToken(id: string, refreshTokenHash: string | null) {
    await this.userRepository.update(id, {
      refreshTokenHash: refreshTokenHash ?? undefined,
    });
  }

  async findMe(userId: string): Promise<MeDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
      relations: [
        'companyRoles',
        'companyRoles.company',
        'companyRoles.company.facturaeParty',
        'clientProfiles'
      ],
    });

    if (!user) throw new NotFoundException('User not found');

    return {
      id: user.id,
      email: user.email,
      userGlobalRole: user.userGlobalRole,
      isActive: user.isActive,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      companyRoles: user.companyRoles?.map((cr) => ({
        companyId: cr.company.id,
        companyName: cr.company.facturaeParty?.legalName ?? 'Empresa sin nombre',
        role: cr.role,
      })),
      clientProfiles: user.clientProfiles ?? [],
    };
  }
}
