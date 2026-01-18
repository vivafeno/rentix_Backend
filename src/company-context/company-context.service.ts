import { Injectable, UnauthorizedException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entidades y Tipos
import { CompanyRoleEntity } from '../user-company-role/entities/userCompanyRole.entity';
import { User } from '../user/entities/user.entity';
import { SelectCompanyDto } from '../auth/dto';
import { TokensDto } from '../auth/dto/tokens.dto';

// Servicios
import { AuthService } from '../auth/auth.service';

/**
 * @description Servicio de Gestión de Contexto (Blueprint 2026).
 * Valida la relación Usuario-Patrimonio y emite una nueva identidad vinculada.
 * @author Rentix
 * @version 2026.1.18
 */
@Injectable()
export class CompanyContextService {
  constructor(
    @InjectRepository(CompanyRoleEntity)
    private readonly userCompanyRoleRepo: Repository<CompanyRoleEntity>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    
    // Usamos forwardRef para evitar dependencias circulares con AuthModule
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  /**
   * @description Selecciona una empresa y genera un set completo de tokens con contexto.
   * @param userId UUID del usuario autenticado
   * @param dto Datos de la empresa seleccionada
   * @returns {Promise<TokensDto>} Tokens de acceso y refresco actualizados
   */
  async selectCompany(userId: string, dto: SelectCompanyDto): Promise<TokensDto> {
    const { companyId } = dto;

    // 1. Validación de Blindaje: ¿Existe la relación activa?
    const relation = await this.userCompanyRoleRepo.findOne({
      where: { 
        user: { id: userId }, 
        company: { id: companyId },
        isActive: true 
      },
      relations: ['user'] // Necesitamos el appRole del usuario
    });

    // 2. Control de Acceso: Solo permitimos si existe relación o si el usuario es un perfil especial
    if (!relation) {
      // Opcional: Podrías buscar si el usuario es SUPERADMIN aquí si no tiene relación explícita
      throw new ForbiddenException('Acceso denegado: No posees un rol activo en este patrimonio.');
    }

    /**
     * @description DELEGACIÓN DE IDENTIDAD (Blueprint 2026)
     * En lugar de generar el JWT aquí, usamos el AuthService.login.
     * Esto asegura que:
     * 1. Se genere el refreshToken (arregla tu error de compilación).
     * 2. Se actualice el hash del token en la base de datos.
     * 3. El payload sea consistente con el resto del sistema.
     */
    return this.authService.login(relation.user, {
      id: companyId,
      role: relation.role
    });
  }
}