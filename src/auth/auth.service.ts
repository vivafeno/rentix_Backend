import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UserService } from '../user/user.service';
import { TokensDto } from './dto/tokens.dto';
import { User } from 'src/user/entities/user.entity';
import type { ActiveUserData } from './interfaces/jwt-payload.interface';
import { AppRole } from './enums/user-global-role.enum';
import { CompanyRole } from 'src/user-company-role/enums/companyRole.enum';

/**
 * @class AuthService
 * @description Núcleo de Autenticación y Emisión de Contexto (Blueprint 2026).
 * Gestiona el ciclo de vida de los tokens (Access/Refresh) y el blindaje de credenciales.
 * @version 2026.1.19
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * @method validateUser
   * @description Valida credenciales primarias contra el hash almacenado.
   */
  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales de acceso no válidas.');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales de acceso no válidas.');
    }

    return user;
  }

  /**
   * @method login
   * @description Genera el par de tokens (Access/Refresh) con claims tipados.
   * Resuelve error 62 eliminando el uso de 'any' en el mapeo del payload.
   */
  async login(
    user: User,
    companyContext?: { id: string; role: string },
  ): Promise<TokensDto> {
    // 🛡️ Blindaje de Payload: Evitamos 'any' y aseguramos consistencia con la interfaz
    const payload: ActiveUserData = {
      sub: user.id,
      email: user.email,
      appRole: user.appRole,
      companyId: companyContext?.id || '',
      companyRole: (companyContext?.role as CompanyRole) || ('' as CompanyRole),
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    // Persistencia del hash del refresh token para rotación segura
    await this.usersService.updateRefreshToken(
      user.id,
      await bcrypt.hash(refreshToken, 10),
    );

    return { accessToken, refreshToken };
  }

  /**
   * @method selectCompany
   * @description Permite al usuario cambiar su contexto de trabajo (Patrimonio).
   */
  async selectCompany(userId: string, companyId: string): Promise<TokensDto> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Identidad no encontrada.');
    }

    const roleInCompany = user.companyRoles?.find(
      (r) => r.companyId === companyId,
    );

    // 🛡️ Comparación segura de Enums casteando a string
    const isSuperAdmin =
      (user.appRole as string) === (AppRole.SUPERADMIN as string);

    if (!roleInCompany && !isSuperAdmin) {
      throw new ForbiddenException(
        'Acceso denegado: No posees vinculación con este patrimonio.',
      );
    }

    return await this.login(user, {
      id: companyId,
      role: roleInCompany?.role || 'VIEWER', // Default seguro si es SuperAdmin sin rol específico
    });
  }

  /**
   * @method refresh
   * @description Procesa la renovación de tokens validando la firma y el hash en DB.
   */
  async refresh(refreshToken: string): Promise<TokensDto> {
    try {
      const payload = await this.jwtService.verifyAsync<ActiveUserData>(
        refreshToken,
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      );

      const user = await this.usersService.findById(payload.sub);

      if (!user?.refreshTokenHash) {
        throw new UnauthorizedException('Sesión expirada.');
      }

      const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!isValid) {
        throw new UnauthorizedException('Token de refresco no válido.');
      }

      const context = payload.companyId
        ? { id: payload.companyId, role: payload.companyRole as string }
        : undefined;

      return await this.login(user, context);
    } catch {
      throw new UnauthorizedException(
        'Error en el proceso de renovación de sesión.',
      );
    }
  }

  /**
   * @method logout
   * @description Revoca el acceso invalidando el refresh token en base de datos.
   */
  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }
}
