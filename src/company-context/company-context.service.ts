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
    // 💡 CAMBIO: Usamos leftJoinAndSelect para permitir empresas que aún no tienen facturaeParty
    const relation = await this.userCompanyRoleRepo
      .createQueryBuilder('ucr')
      .leftJoinAndSelect('ucr.company', 'company')
      .leftJoinAndSelect('company.facturaeParty', 'facturaeParty') 
      .innerJoin('ucr.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('company.id = :companyId', { companyId })
      .andWhere('ucr.isActive = true')
      .getOne();

    if (!relation) throw new UnauthorizedException('No tienes acceso a esa empresa');

    // 3. Crear un nuevo accessToken contextualizado
    const payload = {
      sub: user.id,
      appRole: user.appRole,
      companyId: relation.company.id,
      companyRole: relation.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1h', // He subido el tiempo un poco para desarrollo
    });

    // 4. Devolver token + info básica
    return {
      accessToken,
      company: {
        id: relation.company.id,
        // 💡 CAMBIO: Protección con el encadenamiento opcional (?.) por si facturaeParty es null
        name: relation.company.facturaeParty?.facturaeName || 'Empresa en configuración', 
        role: relation.role,
      },
    };
  } 
 
}


  
