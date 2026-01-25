import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UserService } from '../user/user.service';
import { TokensDto } from './dto/tokens.dto';
import { User } from 'src/user/entities/user.entity';
import type { ActiveUserData } from './interfaces/jwt-payload.interface';
import { AppRole } from './enums/user-global-role.enum';
import { CompanyRole } from 'src/user-company-role/enums/user-company-role.enum';

/**
 * @class AuthService
 * @description Orquestador central de identidad y contexto multi-tenant.
 * Implementa rotación de tokens, validación de hashes y blindaje de jerarquías.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * @method validateUser
   * @description Validación de identidad primaria.
   */
  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.usersService.findByEmailForAuth(email);
    
    if (!user || !user.isActive) {
      this.logger.warn(`Intento de login fallido o cuenta inactiva: ${email}`);
      throw new UnauthorizedException('Credenciales de acceso no válidas.');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Credenciales de acceso no válidas.');

    return user;
  }

  /**
   * @method login
   * @description Genera el par de tokens (Access/Refresh) inyectando el contexto patrimonial.
   * Resuelve Error 2741: Inclusión obligatoria de tokenType.
   */
  async login(
    user: User,
    companyContext?: { id: string; role: CompanyRole },
  ): Promise<TokensDto> {
    let context = companyContext;
    
    // Gema Rentix: Auto-selección de empresa primaria (isPrimary) o primera disponible
    if (!context && user.companyRoles?.length > 0) {
      const primary = user.companyRoles.find(r => r.isPrimary) || user.companyRoles[0];
      context = { id: primary.companyId, role: primary.role };
    }

    const payload: ActiveUserData = {
      id: user.id,
      email: user.email,
      appRole: user.appRole,
      activeCompanyId: context?.id ?? '',
      companyRole: context?.role,
    };

    // Generación paralela de tokens para optimizar latencia
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(
        { id: user.id },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    // Persistencia del hash del Refresh Token para rotación segura
    await this.usersService.updateRefreshToken(
      user.id,
      await bcrypt.hash(refreshToken, 10),
    );

    return { 
      accessToken, 
      refreshToken, 
      tokenType: 'Bearer' // ✅ Corregido: Propiedad requerida por TokensDto
    };
  }

  /**
   * @method selectCompany
   * @description Intercambio de contexto (Switch Tenant).
   * Resuelve Error 2367: Comparación segura contra AppRole enum.
   */
  async selectCompany(userId: string, companyId: string): Promise<TokensDto> {
    const user = await this.usersService.findByIdForAuth(userId);

    if (!user) throw new UnauthorizedException('Identidad no encontrada.');

    const roleInCompany = user.companyRoles?.find(r => r.companyId === companyId);
    
    // ✅ Corregido: Comparación lógica estricta contra el Enum
    const isSuperAdmin = user.appRole === AppRole.SUPERADMIN;

    if (!roleInCompany && !isSuperAdmin) {
      throw new ForbiddenException('No tiene permisos en este patrimonio.');
    }

    return this.login(user, {
      id: companyId,
      role: roleInCompany?.role || CompanyRole.VIEWER,
    });
  }

  /**
   * @method refresh
   * @description Rotación de tokens con validación de persistencia.
   */
  async refresh(refreshToken: string): Promise<TokensDto> {
    try {
      const { id } = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findByIdForAuth(id);

      if (!user?.refreshTokenHash || !user.isActive) {
        throw new UnauthorizedException('Sesión expirada o cuenta inactiva.');
      }

      const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      
      if (!isValid) {
        // Alerta de seguridad: Si el token no coincide, revocamos todo (posible robo)
        await this.logout(user.id);
        throw new UnauthorizedException('Token de refresco inválido o comprometido.');
      }

      return this.login(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Error de refresco de sesión.');
    }
  }

  /**
   * @method logout
   * @description Revoca el token de refresco del usuario.
   */
  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }
}