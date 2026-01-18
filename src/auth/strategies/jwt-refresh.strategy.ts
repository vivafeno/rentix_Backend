import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AppRole } from '../enums/user-global-role.enum';

/**
 * @description Estrategia de Validación de Token de Refresco (Blueprint 2026).
 * Se encarga de validar el Refresh Token enviado en el cuerpo de la petición
 * para emitir nuevos Access Tokens sin requerir login manual.
 * * @author Rentix
 * @version 2026.1.18
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  
  /**
   * @description Configura la estrategia extrayendo el token desde el body.
   * @param configService Inyección del servicio de configuración para acceso seguro a secretos.
   */
  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>('JWT_REFRESH_SECRET');

    if (!secret) {
      throw new Error('CONFIG_ERROR: JWT_REFRESH_SECRET no definido en el entorno.');
    }

    super({
      // Blueprint 2026: Extraemos el token del campo 'refreshToken' del body
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true, // Permite acceder a la request original si fuera necesario
    });
  }

  /**
   * @description Valida el payload del Refresh Token.
   * A diferencia del Access Token, este suele ser más ligero pero debe contener 
   * la identidad suficiente para la re-emisión.
   * * @param req Objeto Request de Express
   * @param payload Estructura decodificada del token (sub, email, appRole)
   * @returns Identidad simplificada del usuario
   */
  async validate(req: any, payload: any) {
    if (!payload) {
      throw new UnauthorizedException('Refresh Token malformado o inválido.');
    }

    // Retornamos el payload hidratado para que el controlador de Refresh lo procese
    return { 
      userId: payload.sub, 
      email: payload.email, 
      appRole: payload.appRole as AppRole 
    };
  }
}