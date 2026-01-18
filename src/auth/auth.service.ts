import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UserService } from '../user/user.service';
import { TokensDto } from './dto/tokens.dto';
import { User } from 'src/user/entities/user.entity';

/**
 * @description Núcleo de Autenticación y Emisión de Contexto (Blueprint 2026).
 * Gestiona el ciclo de vida de los tokens y el blindaje de credenciales.
 * @author Rentix
 * @version 2026.1.18
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * @description Valida credenciales primarias para LocalStrategy.
   * @throws {UnauthorizedException} Si las credenciales no coinciden.
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
   * @description Genera un par de tokens (Access/Refresh) con claims de identidad.
   * @param user Entidad de usuario
   * @param companyContext Opcional: Contexto de empresa (ID y Rol)
   */
  async login(user: User, companyContext?: { id: string; role: string }): Promise<TokensDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      appRole: user.appRole,
      // 🛡️ Blueprint 2026: Inyección de contexto si existe
      companyId: companyContext?.id || null,
      companyRole: companyContext?.role || null,
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
   * @description Realiza el Context Overriding validando la relación usuario-empresa.
   */
  async selectCompany(userId: string, companyId: string): Promise<TokensDto> {
    const user = await this.usersService.findById(userId);
    
    // 🛡️ Validación de nulidad (Soluciona TS18047 y TS2345)
    if (!user) {
      throw new UnauthorizedException('Identidad no encontrada.');
    }

    // Buscamos el rol específico en el contexto solicitado
    const roleInCompany = user.companyRoles?.find(r => r.companyId === companyId);
    
    // Blindaje: Solo SUPERADMIN o miembros con rol pueden entrar
    if (!roleInCompany && user.appRole !== 'SUPERADMIN') {
      throw new ForbiddenException('No tienes permisos en este patrimonio.');
    }

    // Ahora TS sabe que 'user' no es null
    return this.login(user, { 
      id: companyId, 
      role: roleInCompany?.role || 'ADMIN' 
    });
  }

  /**
   * @description Rotación de tokens basada en Refresh Token persistido.
   */
  async refresh(refreshToken: string): Promise<TokensDto> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);

      if (!user?.refreshTokenHash) {
        throw new UnauthorizedException('Sesión no encontrada o expirada.');
      }

      const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!isValid) throw new UnauthorizedException('Token de refresco inválido.');

      // Mantenemos el contexto de empresa si ya existía en el token viejo
      const context = payload.companyId ? { id: payload.companyId, role: payload.companyRole } : undefined;
      return this.login(user, context);
    } catch {
      throw new UnauthorizedException('Error en la renovación de sesión.');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }
}