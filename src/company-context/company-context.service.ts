// src/company-context/company-context.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyRoleEntity } from '../user-company-role/entities/userCompanyRole.entity';
import { User } from '../user/entities/user.entity';
import { SelectCompanyDto } from './dto/select-company.dto';

@Injectable()
export class CompanyContextService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(CompanyRoleEntity)
    private readonly userCompanyRoleRepo: Repository<CompanyRoleEntity>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  async selectCompany(userId: string, dto: SelectCompanyDto) {
    const { companyId } = dto;

    // 1. Comprobar que el usuario existe
    const user = await this.userRepo.findOne({ where: { id: userId, isActive: true } });
    if (!user) throw new UnauthorizedException('Usuario no encontrado o inactivo');

    // 2. Comprobar que el usuario pertenece a esa empresa
    const relation = await this.userCompanyRoleRepo
      .createQueryBuilder('ucr')
      .innerJoinAndSelect('ucr.company', 'company')
      .innerJoinAndSelect('company.facturaeParty', 'facturaeParty')
      .innerJoin('ucr.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('company.id = :companyId', { companyId })
      .andWhere('ucr.isActive = true')
      .getOne();

    if (!relation) throw new UnauthorizedException('No tienes acceso a esa empresa');

    // 3. Crear un nuevo accessToken contextualizado
    const payload = {
      sub: user.id,
      userGlobalRole: user.appRole,
      companyId: relation.company.id,
      companyRole: relation.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    return {
      accessToken,
      company: {
        id: relation.company.id,
        name: relation.company.facturaeParty.corporateName ||
          `${relation.company.facturaeParty.firstName} ${relation.company.facturaeParty.lastName}`.trim(),
        role: relation.role,
      },
    };
  }
}
