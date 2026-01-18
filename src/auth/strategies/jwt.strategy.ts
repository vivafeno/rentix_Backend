import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../user/entities/user.entity';

/**
 * @description Estrategia de Validación JWT (Blueprint 2026).
 * Se encarga de decodificar el token, verificar su firma y transformar el payload 
 * en una entidad de usuario hidratada con datos frescos de la base de datos.
 * * * @author Rentix
 * @version 2026.1.18
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService
  ) {
    const secret = configService.get<string>('JWT_ACCESS_SECRET');
    
    if (!secret) {
      throw new Error('CONFIG_ERROR: JWT_ACCESS_SECRET no definido en el entorno.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Blueprint 2026: Nunca ignorar expiración en producción
      secretOrKey: secret,
    });
  }

  /**
   * @description Método de validación interna de Passport.
   * Transforma el payload del JWT en el objeto 'request.user'.
   * * @param payload Estructura decodificada del JWT (sub, companyId, companyRole, etc.)
   * @returns {Promise<any>} Entidad de usuario combinada con contexto operativo
   * @throws {UnauthorizedException} Si el usuario no cumple los criterios de seguridad activos
   */
  async validate(payload: any): Promise<any> {
    const { sub: id, companyId, companyRole } = payload;

    // 1. Hidratación: Obtenemos el estado real del usuario desde la persistencia
    // Esto evita ataques donde un usuario revocado sigue usando un token válido cronológicamente.
    const user = await this.userRepository.findOne({
      where: { id },
    });

    // 2. Blindaje de Existencia y Estado
    if (!user) {
      throw new UnauthorizedException('SEGURIDAD: Identidad no encontrada o revocada.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('SEGURIDAD: Cuenta de usuario suspendida.');
    }

    /**
     * @description RETORNO DE IDENTIDAD (Context Overriding)
     * Combinamos la entidad real de la DB (que contiene appRole actualizado)
     * con los claims de contexto (companyId y companyRole) que vienen en el token.
     */
    return {
      ...user,
      companyId,    // ID de la empresa seleccionada en el proceso de Login/Switch
      companyRole,  // Rol específico en esa empresa
    };
  }
}