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

// src/company-context/company-context.service.ts

async selectCompany(userId: string, dto: SelectCompanyDto) {
  const { companyId } = dto;

  // 1. Buscamos la relación de forma directa y sencilla
  // Usamos el repositorio para asegurar que traemos la entidad Company vinculada
  const relation = await this.userCompanyRoleRepo.findOne({
    where: { 
      user: { id: userId }, 
      company: { id: companyId },
      isActive: true 
    },
    relations: ['company', 'user']
  });

  if (!relation) {
    throw new UnauthorizedException('No tienes acceso a esa empresa');
  }

  // 2. PAYLOAD CRÍTICO: Aquí es donde se inyecta la empresa
  // Aseguramos que los nombres coincidan con lo que tus Guards esperan
  const payload = {
    sub: userId,              // ID del usuario
    appRole: relation.user.appRole, // Rol global (SUPERADMIN, USER...)
    companyId: companyId,     // 👈 ESTO ES LO QUE TE FALTA
    companyRole: relation.role // OWNER, GESTOR, etc.
  };

  // 3. Generamos el token
  const accessToken = await this.jwtService.signAsync(payload);

  return {
    accessToken,
    company: {
      id: relation.company.id,
      role: relation.role
    }
  };
}
 
}


  
