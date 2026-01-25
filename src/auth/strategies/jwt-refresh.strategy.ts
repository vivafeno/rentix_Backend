import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ActiveUserData } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>('JWT_REFRESH_SECRET');

    if (!secret) {
      throw new InternalServerErrorException('JWT_REFRESH_SECRET no definido.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true, // Necesario para comparar el token físico con el hash en BD
    });
  }

  /**
   * @method validate
   * @description Valida el sujeto (sub) del token y prepara la rotación segura.
   */
  validate(req: any, payload: Partial<ActiveUserData>): { id: string, refreshToken: string } {
    if (!payload || !payload.id) {
      throw new UnauthorizedException('Sesión inválida.');
    }

    // 🚩 Rigor 2026: Extraemos el token crudo del body para que el AuthService 
    // pueda compararlo contra el hash almacenado en la Base de Datos.
    const refreshToken = req.body.refreshToken;

    return {
      id: payload.id,
      refreshToken,
    };
  }
}