import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../user/entities/user.entity';
import { ActiveUserData } from '../interfaces/jwt-payload.interface';
/**
 * @class JwtStrategy
 * @description Estrategia de Validación JWT (Blueprint 2026).
 * Hidrata la request con datos del usuario y contexto de empresa.
 * @version 2026.1.19
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_ACCESS_SECRET');

    if (!secret) {
      throw new Error(
        'CONFIG_ERROR: JWT_ACCESS_SECRET no definido en el entorno.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * @method validate
   * @description Valida el payload y retorna los datos del usuario activo.
   * Resuelve errores 44, 47, 64 y 65 al eliminar el uso de 'any'.
   * @param {ActiveUserData} payload Datos decodificados del token
   * @returns {Promise<ActiveUserData>} Datos para inyectar en request.user
   */
  async validate(payload: ActiveUserData): Promise<ActiveUserData> {
    const { sub: id, companyId, companyRole } = payload;

    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'SEGURIDAD: Identidad no válida o inactiva.',
      );
    }

    /**
     * @description Normalización del objeto ActiveUserData.
     * Mapeamos explícitamente los campos para garantizar la compatibilidad
     * con los decoradores de seguridad y la lógica multi-tenant.
     */
    return {
      sub: user.id,
      email: user.email,
      appRole: user.appRole,
      companyId: companyId || '',
      companyRole: companyRole || '',
    };
  }
}
