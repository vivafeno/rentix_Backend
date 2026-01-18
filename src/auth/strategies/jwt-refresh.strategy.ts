import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ActiveUserData } from '../interfaces/jwt-payload.interface';

/**
 * @class JwtRefreshStrategy
 * @description Estrategia de Validación de Token de Refresco (Blueprint 2026).
 * Gestiona la rotación de tokens mediante validación en el cuerpo de la petición.
 * @version 2026.1.19
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>('JWT_REFRESH_SECRET');

    if (!secret) {
      throw new Error(
        'CONFIG_ERROR: JWT_REFRESH_SECRET no definido en el entorno.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  /**
   * @method validate
   * @description Valida el payload del Refresh Token.
   * Resuelve errores 49, 56, 57 y 58 mediante tipado estricto y eliminación de async innecesario.
   * @param {Request} _req Petición original (no utilizada)
   * @param {ActiveUserData} payload Estructura decodificada del token
   * @returns {ActiveUserData} Datos del usuario activo
   */
  validate(_req: unknown, payload: ActiveUserData | undefined): ActiveUserData {
    if (!payload || !payload.id) {
      throw new UnauthorizedException('Refresh Token malformado o inválido.');
    }

    // 🚩 Solución linter: Retornamos el objeto tipado directamente.
    // Se elimina el 'async' ya que no hay operaciones de E/S (I/O).
    return {
      id: payload.id,
      email: payload.email,
      appRole: payload.appRole,
      companyId: payload.companyId || '',
      companyRole: payload.companyRole || '',
    };
  }
}
