import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { ActiveUserData } from '../interfaces/jwt-payload.interface';

/**
 * @class JwtStrategy
 * @description Estrategia Stateless de Alto Rendimiento.
 * Elimina la latencia de DB en cada petición confiando en la integridad de la firma.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_ACCESS_SECRET');

    if (!secret) {
      throw new InternalServerErrorException(
        'CONFIG_ERROR: JWT_ACCESS_SECRET no definido.',
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
   * @description Procesa el payload inyectándolo directamente en la request.
   * La validez del usuario se garantiza por la firma del token y el tiempo de expiración.
   */
  validate(payload: ActiveUserData): ActiveUserData {
    // 🚩 Rigor 2026: No consultamos la DB aquí.
    // Si el token es válido, su contenido es ley hasta que expire.
    // Las validaciones de 'isActive' se manejan en el Refresh Token o mediante una Blacklist.
    
    return {
      id: payload.id,
      email: payload.email,
      appRole: payload.appRole,
      companyId: payload.companyId,
      companyRole: payload.companyRole,
    };
  }
}