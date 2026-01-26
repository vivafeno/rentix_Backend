import { 
  Injectable, 
  UnauthorizedException, 
  ForbiddenException, 
  Logger 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { CompanyRole } from '../user-company-role/enums/user-company-role.enum';
import { AppRole } from './enums/user-global-role.enum';
import { ActiveUserData } from './interfaces/jwt-payload.interface';

/**
 * @interface AuthSession
 * @description Contrato inmutable para la Store de Angular 21.
 */
export interface AuthSession {
  user: {
    id: string;
    email: string;
    appRole: AppRole;
    firstName?: string; // Añadido para UX en el Front
    lastName?: string;
  };
  context: {
    activeCompanyId: string;
    companyRole: CompanyRole | null;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
  };
}

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
   * @description Validación de hash con bcrypt.
   */
  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.usersService.findByEmailForAuth(email);
    
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Acceso denegado: Usuario inexistente o inactivo.');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Las credenciales no coinciden.');

    return user;
  }

  /**
   * @method login
   * @description Orquestador de sesión. Garantiza que siempre haya un activeCompanyId válido.
   */
  async login(
    user: User,
    companyContext?: { id: string; role: CompanyRole },
  ): Promise<AuthSession> {
    
    // 1. Lógica de Contexto Atómica
    let activeId = companyContext?.id ?? '';
    let activeRole = companyContext?.role ?? null;

    // Si no hay contexto previo, buscamos la empresa primaria o la primera disponible
    if (!activeId && user.companyRoles?.length > 0) {
      const primary = user.companyRoles.find(r => r.isPrimary) || user.companyRoles[0];
      activeId = primary.companyId;
      activeRole = primary.role;
    }

    // 2. Payload para el Interceptor del Front
    const payload: ActiveUserData = {
      id: user.id,
      email: user.email,
      appRole: user.appRole,
      activeCompanyId: activeId,
      companyRole: activeRole as CompanyRole,
    };

    // 3. Generación de Tokens Determinista
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

    // 4. Persistencia del Hash de refresco (Seguridad)
    const hashedRT = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashedRT);

    // 5. Estructura para Signals (Angular 21)
    return {
      user: {
        id: user.id,
        email: user.email,
        appRole: user.appRole,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      context: {
        activeCompanyId: activeId,
        companyRole: activeRole,
      },
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
      },
    };
  }

  /**
   * @method selectCompany
   * @description El motor del "Switch" de empresa. Regenera el JWT con el nuevo contexto.
   */
  async selectCompany(userId: string, companyId: string): Promise<AuthSession> {
    const user = await this.usersService.findByIdForAuth(userId);
    if (!user) throw new UnauthorizedException('Sesión corrupta.');

    const roleInCompany = user.companyRoles?.find(r => r.companyId === companyId);
    const isSuperAdmin = user.appRole === AppRole.SUPERADMIN;

    if (!roleInCompany && !isSuperAdmin) {
      throw new ForbiddenException('No tiene acceso al patrimonio solicitado.');
    }

    return await this.login(user, {
      id: companyId,
      role: roleInCompany?.role || CompanyRole.VIEWER,
    });
  }

  async refresh(refreshToken: string): Promise<AuthSession> {
    try {
      const { id } = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findByIdForAuth(id);
      if (!user?.refreshTokenHash || !user.isActive) {
        throw new UnauthorizedException('Usuario inhabilitado.');
      }

      const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!isValid) {
        await this.logout(user.id);
        throw new UnauthorizedException('Token de refresco comprometido.');
      }

      return await this.login(user);
    } catch (e) {
      throw new UnauthorizedException('Sesión expirada.');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }
}